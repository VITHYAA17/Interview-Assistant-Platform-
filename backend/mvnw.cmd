@REM PrepWise Portable Maven Wrapper
@echo off
setlocal
set DIRNAME=%~dp0
if not exist "%DIRNAME%.maven\apache-maven-3.9.9\bin\mvn.cmd" (
    echo [PrepWise] Portable Maven not found. Downloading Maven 3.9.9...
    powershell -Command "New-Item -ItemType Directory -Force -Path '%DIRNAME%.maven' | Out-Null; curl.exe -s -L -o '%DIRNAME%.maven\maven.zip' 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip'; Expand-Archive -Path '%DIRNAME%.maven\maven.zip' -DestinationPath '%DIRNAME%.maven' -Force; Remove-Item '%DIRNAME%.maven\maven.zip' -Force"
)
call "%DIRNAME%.maven\apache-maven-3.9.9\bin\mvn.cmd" %*
