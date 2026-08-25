// revalidation.test.mjs — le délai de péremption est-il le même partout ?
//
// Next refuse une constante importée pour `export const revalidate` : la
// valeur doit être analysable statiquement, donc écrite en clair. Elle est
// par conséquent répétée dans les trois pages du site, plus une fois dans
// lib/revalidation.js pour la couche de données.
//
// Quatre copies d'un même nombre finissent toujours par diverger. Ce test
// est ce qui l'empêche : modifier DELAI_REVALIDATION sans toucher les
// pages fait échouer `npm test`, avec le nom du fichier oublié.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DELAI_REVALIDATION } from './revalidation.js'

const RACINE = path.dirname(path.dirname(fileURLToPath(import.meta.url)))

const PAGES = [
  'app/page.js',
  'app/blog/page.js',
  'app/blog/[slug]/page.js',
]

test('le délai de revalidation est un entier de secondes plausible', () => {
  assert.equal(Number.isInteger(DELAI_REVALIDATION), true)
  assert.ok(
    DELAI_REVALIDATION >= 10 && DELAI_REVALIDATION <= 86_400,
    `DELAI_REVALIDATION = ${DELAI_REVALIDATION} : hors des bornes raisonnables ` +
    '(10 s à 24 h). En dessous, on martèle Sanity ; au-dessus, la cliente ' +
    'croit que « Publier » ne marche pas.'
  )
})

for (const page of PAGES) {
  test(`${page} déclare le même délai que lib/revalidation.js`, () => {
    const source = readFileSync(path.join(RACINE, page), 'utf8')
    const trouve = /^export const revalidate = (\d+)$/m.exec(source)

    assert.ok(
      trouve,
      `${page} ne déclare pas « export const revalidate = <nombre> ». ` +
      'Sans cette ligne, la page reste figée sur le contenu du dernier ' +
      'build : publier dans Sanity ne la changera jamais.'
    )

    assert.equal(
      Number(trouve[1]), DELAI_REVALIDATION,
      `${page} annonce ${trouve[1]} s alors que DELAI_REVALIDATION vaut ` +
      `${DELAI_REVALIDATION} s. Les deux doivent concorder, sinon la page ` +
      'et les données qu\'elle lit expirent à des moments différents.'
    )
  })
}
