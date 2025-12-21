$destination_path = "$HOME\Downloads\ppc.zip"
$current_directory = Get-Location
$dirs_to_exclude = @("tests", "playtomic-pc", "bin", ".vscode", ".pytest_cache", ".data", "Lib", "Scripts")

$unix_project_directory = "/opt/playtomic-probability-calculator"
 
$files = Get-ChildItem "$current_directory" | 
where { $_.Name -notin $dirs_to_exclude }

"Compressing selected files"
$compress = @{
  Path             = @($files)
  CompressionLevel = "Fastest"
  DestinationPath  = $destination_path
}
Compress-Archive @compress -Update

ssh xmarston@raspberrypi "cd /tmp/ && rm -rf ppc.zip"
scp $destination_path xmarston@raspberrypi:/tmp/
ssh xmarston@raspberrypi "cd /tmp/ && unzip ppc.zip -d ppc"
ssh xmarston@raspberrypi "cd /tmp/ && sudo rsync -a ppc/ $unix_project_directory/"
ssh xmarston@raspberrypi "cd $unix_project_directory && docker compose build && docker compose down && docker compose up -d --remove-orphans"