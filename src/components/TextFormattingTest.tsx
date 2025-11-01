import { useState } from 'react'
import { formatTextContent, sanitizeText } from '@/lib/formatText'

export function TextFormattingTest() {
  const [testText, setTestText] = useState(`Człowiek wchodzi do baru.
Barman pyta: "Co podać?"
Człowiek odpowiada: "Piwo, proszę."

Barman mówi: "Proszę bardzo."

To był prosty dowcip.

A to już drugi akapit z większą ilością tekstu, żeby pokazać jak zachowuje się formatowanie wieloliniowego.`)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Formatowania Tekstu</h1>

      {/* Original Textarea */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Oryginalny Textarea (jak w adminie):</h2>
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-4 border-2 border-gray-300 rounded-lg"
          rows={8}
          placeholder="Wklej tutaj swój dowcip..."
        />
      </div>

      {/* CSS Approach */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">CSS Approach (white-space: pre-wrap):</h2>
        <div
          className="p-4 border-2 border-blue-300 rounded-lg bg-blue-50"
          style={{ whiteSpace: 'pre-wrap' }}
        >
          {sanitizeText(testText)}
        </div>
      </div>

      {/* HTML Approach */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">HTML Approach (z &lt;br&gt; tags):</h2>
        <div
          className="p-4 border-2 border-green-300 rounded-lg bg-green-50"
          dangerouslySetInnerHTML={{
            __html: formatTextContent(sanitizeText(testText))
          }}
        />
      </div>

      {/* Plain Text */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Plain Text (bez formatowania):</h2>
        <div className="p-4 border-2 border-red-300 rounded-lg bg-red-50">
          {sanitizeText(testText)}
        </div>
      </div>

      <div className="text-sm text-gray-600 mt-6">
        <p><strong>Uwaga:</strong> Porównaj jak wygląda tekst w różnych podejściach. CSS approach powinien wyglądać identycznie jak textarea.</p>
      </div>
    </div>
  )
}