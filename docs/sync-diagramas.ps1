<#
  sync-diagramas.ps1

  Vuelca el codigo fuente de cada .puml dentro de su bloque ```plantuml
  del .md correspondiente, en el mismo orden. Asi el documento y el
  diagrama no pueden desincronizarse: el .puml manda, el .md se regenera.

  Uso (desde la raiz del proyecto):

    pwsh -ExecutionPolicy Bypass -File docs/sync-diagramas.ps1
    pwsh -ExecutionPolicy Bypass -File docs/sync-diagramas.ps1 -Solo clases
    pwsh -ExecutionPolicy Bypass -File docs/sync-diagramas.ps1 -Comprobar

  El -ExecutionPolicy Bypass hace falta porque la politica por defecto de
  Windows no deja ejecutar un .ps1 que no este firmado. Solo afecta a esta
  ejecucion, no cambia la configuracion del equipo.

  Como funciona: los bloques se emparejan POR POSICION, no por nombre. Por eso
  el numero de bloques ```plantuml del .md tiene que coincidir con el numero
  de .puml de la carpeta. Si anades un diagrama, anade tambien su bloque en el
  .md, en el mismo punto, y si quieres teaching un ejemplo de sintaxis ponlo
  con otro lenguaje (```text) para que no cuente como diagrama.
#>

[CmdletBinding()]
param(
  [string]$Solo,
  [switch]$Comprobar
)

$ErrorActionPreference = 'Stop'

$Raiz = Split-Path -Parent $MyInvocation.MyCommand.Path

# Un documento por cada carpeta de diagramas.
$Pares = @(
  @{ Md = 'casos-de-uso.md'; Carpeta = 'casos-de-uso' }
  @{ Md = 'clases.md';      Carpeta = 'clases' }
  @{ Md = 'secuencia.md';   Carpeta = 'secuencia' }
  @{ Md = 'comunicacion.md';Carpeta = 'comunicacion' }
  @{ Md = 'despliegue.md';  Carpeta = 'despliegue' }
)

$Comilla = [string][char]96
$Cercado = $Comilla * 3
$Patron = [regex]::Escape($Cercado + 'plantuml') + '\r?\n[\s\S]*?' + [regex]::Escape($Cercado)
$Utf8SinBom = New-Object System.Text.UTF8Encoding($false)

$desfases = 0

foreach ($par in $Pares) {
  if ($Solo -and $par.Carpeta -ne $Solo) { continue }

  $rutaMd = Join-Path $Raiz $par.Md
  $rutaDir = Join-Path (Join-Path $Raiz 'diagramas') $par.Carpeta

  if (-not (Test-Path $rutaMd)) {
    Write-Warning "$($par.Md): no existe, se omite."
    continue
  }
  if (-not (Test-Path $rutaDir)) {
    Write-Warning "$($par.Carpeta)/: no existe, se omite."
    continue
  }

  $pumls = @(Get-ChildItem -Path $rutaDir -Filter '*.puml' -File | Sort-Object Name)
  if ($pumls.Count -eq 0) {
    Write-Warning "$($par.Carpeta)/: no hay .puml, se omite."
    continue
  }

  $fuentes = @($pumls | ForEach-Object { ([System.IO.File]::ReadAllText($_.FullName)).TrimEnd() })
  $texto = [System.IO.File]::ReadAllText($rutaMd)

  $bloques = ([regex]::Matches($texto, $Patron)).Count
  if ($bloques -ne $fuentes.Count) {
    Write-Warning ("{0}: {1} bloques ```plantuml en el .md pero {2} .puml en {3}/. No se toca." -f `
      $par.Md, $bloques, $fuentes.Count, $par.Carpeta)
    $desfases++
    continue
  }

  $i = 0
  $evaluador = {
    param($m)
    $v = $Cercado + "plantuml`n" + $fuentes[$i] + "`n" + $Cercado
    $script:i++
    return $v
  }

  $nuevo = [regex]::Replace($texto, $Patron, $evaluador)

  if ($nuevo -eq $texto) {
    Write-Host ("{0,-20} ya estaba sincronizado ({1} diagramas)" -f $par.Md, $fuentes.Count)
  } elseif ($Comprobar) {
    Write-Host ("{0,-20} DESFASADO ({1} diagramas)" -f $par.Md, $fuentes.Count) -ForegroundColor Yellow
    $desfases++
  } else {
    [System.IO.File]::WriteAllText($rutaMd, $nuevo, $Utf8SinBom)
    Write-Host ("{0,-20} sincronizado ({1} diagramas)" -f $par.Md, $fuentes.Count)
  }
}

if ($desfases -gt 0) {
  Write-Host ''
  Write-Warning "$desfases documento(s) con problemas. Revisa los avisos anteriores."
  exit 1
}
