#!/bin/bash

# Script para desplegar políticas de privacidad a GitHub Pages
# CarvajalAutoTech - Políticas de Privacidad

echo "🚀 Desplegando políticas de privacidad a GitHub Pages..."

# Verificar si estamos en la rama correcta
current_branch=$(git branch --show-current)
echo "📍 Rama actual: $current_branch"

# Crear rama gh-pages si no existe
if ! git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "📝 Creando rama gh-pages..."
    git checkout -b gh-pages
else
    echo "🔄 Cambiando a rama gh-pages..."
    git checkout gh-pages
fi

# Copiar el archivo HTML como index.html
echo "📋 Copiando políticas de privacidad..."
cp politicas-privacidad.html index.html

# Agregar y hacer commit
echo "💾 Guardando cambios..."
git add index.html
git commit -m "Deploy privacy policy for Play Console - $(date '+%Y-%m-%d %H:%M:%S')"

# Subir a GitHub
echo "⬆️ Subiendo a GitHub..."
git push origin gh-pages

# Volver a la rama principal
echo "🔄 Regresando a rama principal..."
git checkout $current_branch

echo "✅ ¡Políticas de privacidad desplegadas exitosamente!"
echo "🌐 URL: https://pedroza22.github.io/CarvajalAutoTechWeb/"
echo ""
echo "📱 Ahora puedes usar esta URL en Google Play Console:"
echo "   https://pedroza22.github.io/CarvajalAutoTechWeb/"
echo ""
echo "⏰ Puede tomar unos minutos para que esté disponible."
