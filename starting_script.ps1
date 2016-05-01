

$path = $PSScriptRoot + "\"
$server_cmd ="Server_NodeJS.cmd"
$client_cmd = "Client_Kinect_Audio_(Windows).cmd"
Write-host "Starting Script" -foreground "Yellow"
$server_path = $path, $server_cmd -join ""
$client_path  =  $path, $client_cmd -join ""
if( (Test-Path $server_path) -And (Test-Path $client_path) )
{
	Write-host "Find starting script" -foreground "Green"
	$client_app = Start-Process -filepath $client_path -WorkingDirectory $path -passthru
	
	Write-host "Client has started id : " + $client_app.id -foreground "Green"
	#Wait-Process  $client_app.id
	$server_app = Start-Process -filepath $server_cmd -WorkingDirectory $path -passthru
	
	Write-host "Server has started  id : " + $server_app.id -foreground "Green"
	$response = $FALSE;
	do
	{
		$enter=Read-Host -Prompt 'Do you want to Quit ? [Y/N]';
		$enter = $enter.toUpper()
		if($enter.toUpper() -Like "Y")
		{
			Try
			{
			
				get-process $server_app.name | %{ $_.closemainwindow() } 
				#stop-process -id $server_app.id  -passthru -Force
				Write-host "Server has stopped" -foreground "Green"
				$response = $TRUE;
			}
			Catch
			{
				Write-host "Server process ID don't exists" -foreground "Red"
				break;
			}
		}
	}
	while(-Not ($response))
	
	
	
}
else
{

	Write-host "File don't exists at " + $path -foreground "RED"

}