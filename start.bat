@echo off
start /d "server" CALL "database.bat"
start /d "server" CALL "server.bat"
start /d "client" CALL "client.bat"
start /d "client" CALL "browser.bat"
