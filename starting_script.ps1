. ./Ressource.ps1


function Get-Port {
	$portLine=Get-Content .\custom.ini| Where-Object {$_ -like 'port*'}
	$port=$portLine.Split("=")[1]
    $port
}

function Welcome-Message {
	$text=[System.Web.HttpUtility]::UrlEncode("Bienvenue a ITNOVEM")
	$pt = Get-Port
	$url = $localUrl+":"+$pt+"/sarah/dot_text_to_speech?text="+$text
	$response=Invoke-RestMethod -Method GET -Uri $url
}

function Get-NetworkConfig {
Get-WmiObject Win32_NetworkAdapter -Filter 'NetConnectionStatus=2' | where { $_.name -notLike "*Virtual*" } |
    ForEach-Object { 
      $result = 1 | Select-Object Name, IP, MAC
      $result.Name = $_.Name
      $result.MAC = $_.MacAddress
      $config = $_.GetRelated('Win32_NetworkAdapterConfiguration') 
      $result.IP = $config | Select-Object -expand IPAddress
	  $result.IP = $result.IP | where { $_ -match '^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$' }
      $result
    }
}



function sendIpToApi
{
	Write-Host "try to send IP to API"
	$IP=""
	$MAC=""
	do{
		$object= Get-NetworkConfig
		if($object)
		{
			$IP=$object.IP
			$MAC=$object.MAC
		}
		
		if([string]::IsNullOrEmpty($IP))
		{
			Write-Host "No Internet Connexion, try again in 10 seconds"
			Start-Sleep -s 10
		}
	}
	while([string]::IsNullOrEmpty($IP))
	$port=Get-Port
	
	$postParams = @{
	ip_address="$IP"
	mac_address="$MAC"
	port="$port"
	}
	Write-Host "IP:$IP, mac:$MAC port:$port"
	$response=Invoke-RestMethod -Method PUT -Uri $url -ContentType "application/json" -Body (ConvertTo-Json $postParams)
	$response
}


$path = $PSScriptRoot + "\"
$logDirectory = $PSScriptRoot+"\log"
 if (!(Test-Path -path $logDirectory)) {
	Write-Host "Create log directory"
	New-Item $logDirectory -type directory
 }
 
$LogTime = Get-Date -Format "MM-dd-yyyy_hh-mm-ss"
$LogFile = $logDirectory+"\log_"+$LogTime+".txt"
if (!(Test-Path -path $LogFile)) {
	New-Item $LogFile -type file	
}

 
Start-Transcript $LogFile
$path = $PSScriptRoot + "\"
$server_cmd ="Server_NodeJS.cmd"
$client_cmd = "Client_Kinect_Audio_(Windows).cmd"
Write-host "Starting Script" -foreground "Yellow"
$server_path = $path, $server_cmd -join ""
$client_path  =  $path, $client_cmd -join ""
if( (Test-Path $server_path) -And (Test-Path $client_path) )
{
	sendIpToApi
	Write-host "Find starting script" -foreground "Green"
	$ProcessClient= Get-Process WSRMacro -ErrorAction SilentlyContinue
	if($ProcessClient -eq $null){	
		$client_app = Start-Process -filepath $client_path -WorkingDirectory $path -passthru
		Write-host "Client has started id : " + $client_app.id -foreground "Green"
	}
	else
	{
		Write-host "Client is already started : " + $ProcessClient.id  -foreground "Green"
	}
	
	Start-Sleep -s 5
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
				$ProcessClient= Get-Process WSRMacro -ErrorAction SilentlyContinue
				if($ProcessClient -ne $null){
					kill $ProcessClient.Id
					Write-host "Client has stopped" -foreground "Green"
				}
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
Stop-Transcript