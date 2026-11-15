<#
.SYNOPSIS
  Aplica o nome do jogo a uma cópia do modelo godot-template.
  Roda uma única vez, logo após copiar o modelo; ao final remove a si mesmo.

.PARAMETER Name
  Nome de exibição do jogo (ex.: "Meu Jogo"). O nome do .code-workspace
  é derivado dele (ex.: meu-jogo.code-workspace).

.EXAMPLE
  .\setup.ps1 -Name "Meu Jogo"
#>
param([Parameter(Mandatory = $true)][string]$Name)

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$placeholder = "__GAME_NAME__"
# Sem BOM: o Godot e os .md do projeto são UTF-8 puro
$utf8NoBom = New-Object System.Text.UTF8Encoding $false

function Fail([string]$Message) {
    Write-Host "ERRO: $Message" -ForegroundColor Red
    exit 1
}

# Aspas e barras quebrariam a string em project.godot e no JSON do workspace
if ($Name -match '["\\]' -or [string]::IsNullOrWhiteSpace($Name)) {
    Fail "nome inválido: '$Name'. Não use aspas nem barra invertida."
}

# Remove acentos e troca o que não for letra/dígito por hífen: "Ação Já" -> "acao-ja"
$normalized = $Name.Normalize([System.Text.NormalizationForm]::FormD)
$ascii = -join ($normalized.ToCharArray() | Where-Object {
        [Globalization.CharUnicodeInfo]::GetUnicodeCategory($_) -ne [Globalization.UnicodeCategory]::NonSpacingMark
    })
$slug = ($ascii.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-')
if (-not $slug) {
    Fail "não foi possível derivar um nome de arquivo de '$Name'."
}

$placeholderFiles = @(
    (Join-Path $root "game\project.godot"),
    (Join-Path $root "game\AGENTS.md")
)
$workspaceTemplate = Join-Path $root "game.code-workspace"
$workspaceTarget = Join-Path $root "$slug.code-workspace"

# Verifica tudo antes de alterar qualquer arquivo, para não deixar o setup pela metade
foreach ($file in $placeholderFiles) {
    if (-not (Test-Path $file)) { Fail "arquivo não encontrado: $file" }
    if (-not ([IO.File]::ReadAllText($file, $utf8NoBom).Contains($placeholder))) {
        Fail "'$placeholder' não encontrado em $file. O setup já foi aplicado?"
    }
}
if (-not (Test-Path $workspaceTemplate)) { Fail "arquivo não encontrado: $workspaceTemplate" }
if (($workspaceTarget -ne $workspaceTemplate) -and (Test-Path $workspaceTarget)) {
    Fail "já existe $workspaceTarget."
}

# 1. Nome do jogo
foreach ($file in $placeholderFiles) {
    $text = [IO.File]::ReadAllText($file, $utf8NoBom).Replace($placeholder, $Name)
    [IO.File]::WriteAllText($file, $text, $utf8NoBom)
    Write-Host "OK: nome aplicado em $file" -ForegroundColor Green
}

# 2. Workspace: aponta o godot-tools para o mesmo executável que o check usa
$workspace = [IO.File]::ReadAllText($workspaceTemplate, $utf8NoBom)
if ($env:GODOT_PATH) {
    $jsonPath = $env:GODOT_PATH.Replace('\', '\\')
    $workspace = $workspace -replace '("godotTools\.editorPath\.godot4":\s*)"[^"]*"', "`$1`"$jsonPath`""
} else {
    Write-Host "AVISO: GODOT_PATH não definido; godotTools.editorPath.godot4 mantido com o caminho padrão." -ForegroundColor Yellow
}
[IO.File]::WriteAllText($workspaceTarget, $workspace, $utf8NoBom)
if ($workspaceTarget -ne $workspaceTemplate) {
    Remove-Item $workspaceTemplate
}
Write-Host "OK: workspace $slug.code-workspace" -ForegroundColor Green

# 3. O README do modelo é guia de setup; o projeto novo começa com um README próprio
[IO.File]::WriteAllText((Join-Path $root "README.md"), "# $Name`n", $utf8NoBom)
Write-Host "OK: README.md do projeto criado" -ForegroundColor Green

Remove-Item $PSCommandPath

Write-Host "`nSetup concluído. Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. git init -b main  (na pasta $root) e git remote add origin <url>"
Write-Host "  2. Abrir $slug.code-workspace no VS Code"
Write-Host "  3. Em game\: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check.ps1"
exit 0
