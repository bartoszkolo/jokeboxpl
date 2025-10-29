import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Tag,
  Calendar,
  MessageSquare,
  AlertCircle
} from 'lucide-react'

interface Category {
  id: number
  name: string
  slug: string
  description_seo: string
  created_at: string
  jokes_count?: number
}

export const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [addingCategory, setAddingCategory] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description_seo: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select(`
          *,
          jokes(count)
        `)
        .order('name')

      if (error) throw error

      const categoriesWithCount = (data || []).map(category => ({
        ...category,
        jokes_count: category.jokes?.[0]?.count || 0
      }))

      setCategories(categoriesWithCount)
    } catch (error) {
      console.error('Error fetching categories:', error)
      setError('Nie udało się załadować kategorii')
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .replace(/--+/g, '-')
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Nazwa kategorii jest wymagana')
      return false
    }

    if (formData.name.length < 2) {
      setError('Nazwa kategorii musi mieć co najmniej 2 znaki')
      return false
    }

    if (formData.name.length > 100) {
      setError('Nazwa kategorii nie może przekraczać 100 znaków')
      return false
    }

    // Check for duplicate names (excluding current category if editing)
    const isDuplicate = categories.some(category =>
      category.name.toLowerCase() === formData.name.toLowerCase() &&
      category.id !== editingCategory?.id
    )

    if (isDuplicate) {
      setError('Kategoria o tej nazwie już istnieje')
      return false
    }

    setError('')
    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      const slug = generateSlug(formData.name)
      const categoryData = {
        name: formData.name.trim(),
        slug,
        description_seo: formData.description_seo.trim()
      }

      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', editingCategory.id)

        if (error) throw error

        setCategories(categories.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, ...categoryData }
            : cat
        ))

        setSuccess('Kategoria została zaktualizowana')
      } else {
        // Add new category
        const { data, error } = await supabase
          .from('categories')
          .insert(categoryData)
          .select()
          .single()

        if (error) throw error

        setCategories([...categories, { ...data, jokes_count: 0 }])
        setSuccess('Kategoria została dodana')
      }

      // Reset form
      setEditingCategory(null)
      setAddingCategory(false)
      setFormData({ name: '', description_seo: '' })

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error saving category:', error)
      setError('Nie udało się zapisać kategorii')
    }
  }

  const handleDelete = async (category: Category) => {
    if (category.jokes_count && category.jokes_count > 0) {
      setError(`Nie można usunąć kategorii "${category.name}" ponieważ zawiera ${category.jokes_count} dowcipów. Najpierw przenieś lub usuń dowcipy z tej kategorii.`)
      setTimeout(() => setError(''), 5000)
      return
    }

    if (!confirm(`Czy na pewno chcesz usunąć kategorię "${category.name}"? Ta operacja jest nieodwracalna.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (error) throw error

      setCategories(categories.filter(cat => cat.id !== category.id))
      setSuccess('Kategoria została usunięta')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      console.error('Error deleting category:', error)
      setError('Nie udało się usunąć kategorii')
    }
  }

  const startEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description_seo: category.description_seo
    })
    setAddingCategory(false)
    setError('')
  }

  const startAdd = () => {
    setAddingCategory(true)
    setEditingCategory(null)
    setFormData({ name: '', description_seo: '' })
    setError('')
  }

  const cancelEdit = () => {
    setEditingCategory(null)
    setAddingCategory(false)
    setFormData({ name: '', description_seo: '' })
    setError('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Zarządzanie Kategoriami</h2>
          <p className="text-gray-600">Dodawanie, edycja i usuwanie kategorii dowcipów</p>
        </div>
        <button
          onClick={startAdd}
          className="flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj Kategorię
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <p className="text-green-800">{success}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {(addingCategory || editingCategory) && (
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingCategory ? 'Edytuj Kategorię' : 'Dodaj Nową Kategorię'}
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nazwa Kategorii *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="np. Dowcipy o zwierzętach"
                maxLength={100}
              />
              <p className="text-sm text-gray-500 mt-1">
                {formData.name.length}/100 znaków
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Opis SEO
              </label>
              <textarea
                value={formData.description_seo}
                onChange={(e) => setFormData({ ...formData, description_seo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                placeholder="Opis kategorii dla wyszukiwarek (opcjonalnie)"
                rows={3}
              />
              <p className="text-sm text-gray-500 mt-1">
                Ten opis będzie widoczny w wynikach wyszukiwania i pomaga w SEO
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Podgląd Slug (URL)
              </label>
              <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700">
                /kategoria/{generateSlug(formData.name || 'nazwa-kategorii')}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={cancelEdit}
              className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Anuluj
            </button>
            <button
              onClick={handleSave}
              className="flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <Save className="h-4 w-4 mr-2" />
              {editingCategory ? 'Zapisz Zmiany' : 'Dodaj Kategorię'}
            </button>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {categories.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nazwa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug (URL)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Opis SEO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dowcipy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data Utworzenia
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akcje
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Tag className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm font-medium text-gray-900">
                          {category.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs">
                        <p className="text-sm text-gray-600 truncate">
                          {category.description_seo || (
                            <span className="text-gray-400 italic">Brak opisu</span>
                          )}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MessageSquare className="h-4 w-4 mr-1 text-gray-400" />
                        {category.jokes_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(category.created_at).toLocaleDateString('pl-PL')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => startEdit(category)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edytuj"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category)}
                          className={`${
                            category.jokes_count && category.jokes_count > 0
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-red-600 hover:text-red-900'
                          }`}
                          title={
                            category.jokes_count && category.jokes_count > 0
                              ? 'Nie można usunąć - kategoria zawiera dowcipy'
                              : 'Usuń'
                          }
                          disabled={category.jokes_count && category.jokes_count > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Brak kategorii
            </h3>
            <p className="text-gray-600 mb-4">
              Nie dodano jeszcze żadnych kategorii. Dodaj pierwszą kategorię, aby organizować dowcipy.
            </p>
            <button
              onClick={startAdd}
              className="inline-flex items-center px-4 py-2 bg-yellow-400 text-yellow-900 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Dodaj Pierwszą Kategorię
            </button>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Tag className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Wszystkie Kategorie</p>
              <p className="text-2xl font-bold text-gray-900">{categories.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Łączna Liczba Dowcipów</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.reduce((sum, cat) => sum + (cat.jokes_count || 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Średnia Dowcipów na Kategorię</p>
              <p className="text-2xl font-bold text-gray-900">
                {categories.length > 0
                  ? (categories.reduce((sum, cat) => sum + (cat.jokes_count || 0), 0) / categories.length).toFixed(1)
                  : '0'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}