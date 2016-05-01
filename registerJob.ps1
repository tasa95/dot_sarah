
$Path = $PSScriptRoot + "\" + "starting_script.ps1"
$Trigger = New-JobTrigger -AtStartup -RandomDelay 00:00:30
Register-ScheduledJob -Trigger $Trigger -FilePath $Path -Name SarahDot