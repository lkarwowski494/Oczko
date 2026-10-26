require 'json'
package = JSON.parse(File.read(File.join(__dir__, 'package.json')))

# Moduł Expo (ADR-0007, ADR-0011, ADR-0012, P-221 Q1a, Q2a): jedyny kod PDFKit, PencilKit, WebKit i VisionKit w aplikacji. Logika czysta
# (polityka płótna, papier, źródło konwersji, wynik JSON) w pakiecie Pakiet/ (`swift test`), kompilowana tu wprost — bez kopii.
Pod::Spec.new do |s|
  s.name           = 'OczkoWzor'
  s.version        = package['version']
  s.summary        = 'Pattern viewer with PencilKit pages, PDF conversion and page scanner'
  s.description    = 'PDFView with a PencilKit canvas over each page, web page and Word to PDF, document scanner.'
  s.author         = ''
  s.homepage       = 'https://github.com/lkarwowski494/oczko'
  s.platforms      = { :ios => '18.0' } # ADR-0006: minimum iOS 18
  s.source         = { git: '' }
  s.static_framework = true
  s.swift_version  = '5.9'
  s.frameworks     = 'PDFKit', 'PencilKit', 'WebKit', 'VisionKit', 'AVFoundation'
  s.dependency 'ExpoModulesCore'
  s.pod_target_xcconfig = { 'DEFINES_MODULE' => 'YES', 'SWIFT_COMPILATION_MODE' => 'wholemodule' }
  s.source_files = ['ios/**/*.swift', 'Pakiet/Sources/OczkoWzorLogika/*.swift']
  # Testy okna maszyn (W1–W3, docs/programista/partia-6-natywne.md): test spec CocoaPods, poza buildem aplikacji.
  s.test_spec 'Testy' do |t|
    t.source_files = 'TestyOknaMaszyn/*.swift'
    t.frameworks = 'XCTest'
    t.resources = 'TestyOknaMaszyn/korpus/*.docx' # node TestyOknaMaszyn/korpus/generuj-korpus.mjs
  end
end
