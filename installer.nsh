!macro customUnInstall
  SetShellVarContext current
  RMDir /r /REBOOTOK $APPDATA\${APP_FILENAME}
!macroend
