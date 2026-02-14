# Fix npm offline mode and install dependencies
cd "c:\Users\khushi\OneDrive\Desktop\ecom project"
$env:npm_config_offline = $null
npm config set offline false
Write-Host "Installing dependencies... This may take a few minutes."
npm install
Write-Host "Installation complete! Starting dev server..."
npm run dev
