npm run build
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

npx cap sync
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

$env:JAVA_HOME="C:\Program Files\Eclipse Adoptium\jdk-17.0.15.6-hotspot"
cd android
.\gradlew assembleDebug
