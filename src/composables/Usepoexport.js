/**
 * usePOExport.js
 * Composable to generate a professional Purchase Order / Invoice PDF
 * using pdfmake (already installed).
 *
 * Usage in your component:
 *   import { usePOExport } from '@/composables/usePOExport'
 *   const { downloadPO, loadingPDF } = usePOExport()
 *   await downloadPO(poObject)
 */

import { ref } from 'vue'
import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import logo from '@/assets/logo-removebg-preview.png'

pdfMake.vfs = pdfFonts.vfs

// ─── Helpers ────────────────────────────────────────────────────────────────

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function fmtMoney(n) {
  return '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })
}

function statusLabel(s) {
  return (
    {
      draft: 'Draft',
      sent: 'Sent',
      acknowledged: 'Acknowledged',
      fulfilled: 'Fulfilled',
      cancelled: 'Cancelled'
    }[s] || s
  )
}

/** Convert an image URL or local path to a base64 data URL */
async function toBase64(url) {
  try {
    const res = await fetch(url)
    const blob = await res.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

// ─── Brand colours (matching your app) ──────────────────────────────────────
const NAVY = '#0f4c81'
const NAVY2 = '#1565c0'
const STEEL = '#e8f0fb'
const DARK = '#0f2942'
const GREY = '#64748b'
const LGREY = '#f4f7fc'
const WHITE = '#ffffff'

// Status badge colour
function statusFill(s) {
  return (
    {
      draft: '#d97706',
      sent: '#0284c7',
      acknowledged: '#7c3aed',
      fulfilled: '#059669',
      cancelled: '#64748b'
    }[s] || '#64748b'
  )
}

// ─── Main composable ─────────────────────────────────────────────────────────

export function usePOExport() {
  const loadingPDF = ref(false)

  /**
   * @param {Object} po  - the full PO object (with nested suppliers, supplies, etc.)
   */
  async function downloadPO(po) {
    loadingPDF.value = true
    try {
      // Try to load company logo from assets
      const logoBase64 = await toBase64(logo)

      const docDef = buildDocDef(po, logoBase64)
      pdfMake.createPdf(docDef).download(`${po.po_number}.pdf`)
    } finally {
      loadingPDF.value = false
    }
  }

  return { downloadPO, loadingPDF }
}

// ─── Document definition ─────────────────────────────────────────────────────

function buildDocDef(po, logoBase64) {
  const supplier = po.suppliers || {}
  const supply = po.supplies || {}
  const request = po.supply_requests || {}
  const raisedBy = po.raised_by_user || {}
  const category = supply.supply_categories || {}

  const subtotal = Number(po.total_amount || 0)
  const tax = Number(po.tax_amount || 0)
  const grand = Number(po.grand_total || 0)

  const raiser = `${raisedBy.first_name || ''} ${raisedBy.last_name || ''}`.trim() || '—'

  // ── Timeline rows ──
  const timelineSteps = [
    { label: 'Created', date: po.created_at, done: true },
    { label: 'Sent', date: po.sent_at, done: !!po.sent_at },
    { label: 'Acknowledged', date: po.acknowledged_at, done: !!po.acknowledged_at },
    { label: 'Fulfilled', date: po.fulfilled_at, done: !!po.fulfilled_at }
  ]

  // ── Header logo cell ──
  const logoCell = logoBase64
    ? {
        image: logoBase64,
        width: 70,
        fit: [70, 70],
        alignment: 'left'
      }
    : {
        text: 'TEINNOVATE\nCAPITAL',
        style: 'logoFallback',
        alignment: 'left'
      }

  return {
    pageSize: 'A4',
    pageMargins: [0, 0, 0, 0],

    background(currentPage, pageSize) {
      return [
        // Clean white page background
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: pageSize.width,
              h: pageSize.height,
              color: WHITE
            }
          ]
        },

        // Thin top accent line
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: 0,
              w: pageSize.width,
              h: 6,
              color: NAVY
            }
          ]
        },

        // Bottom footer band
        {
          canvas: [
            {
              type: 'rect',
              x: 0,
              y: pageSize.height - 38,
              w: pageSize.width,
              h: 38,
              color: NAVY
            }
          ]
        }
      ]
    },
    content: [
      // ══ HEADER BAND ══════════════════════════════════════════════
      // ══ HEADER ══════════════════════════════════════════════
      {
        margin: [40, 28, 40, 0],
        columns: [
          // LEFT
          {
            width: '50%',
            stack: [
              logoCell,
              {
                text: 'Teinnovate Capital',
                fontSize: 16,
                bold: true,
                color: DARK,
                margin: [0, 10, 0, 0]
              }
            ]
          },

          // RIGHT
          {
            width: '50%',
            alignment: 'right',
            stack: [
              {
                text: 'PURCHASE ORDER',
                fontSize: 10,
                bold: true,
                color: GREY,
                letterSpacing: 2,
                margin: [0, 0, 0, 6]
              },

              {
                text: po.po_number,
                fontSize: 24,
                bold: true,
                color: DARK
              }
            ]
          }
        ]
      },
      // ── FROM / TO block ──────────────────────────────────────────
      {
        margin: [40, 48, 40, 0],
        columns: [
          // FROM
          {
            width: '48%',
            stack: [
              { text: 'FROM', style: 'sectionLabel' },
              { text: 'Teinnovate Capital', style: 'companyName' },
              { text: 'Lagos, Nigeria', style: 'bodyText' },
              { text: 'procurement@teinnovate.com', style: 'bodyText' }
            ]
          },
          { width: '4%', text: '' },
          // TO
          {
            width: '48%',
            stack: [
              { text: 'TO (SUPPLIER)', style: 'sectionLabel' },
              { text: supplier.name || '—', style: 'companyName' },
              {
                text: supplier.contact_person ? `Attn: ${supplier.contact_person}` : '',
                style: 'bodyText'
              },
              { text: supplier.email || '', style: 'bodyText' },
              { text: supplier.phone || '', style: 'bodyText' },
              { text: supplier.address || '', style: 'bodyText' }
            ]
          }
        ]
      },

      // ── Meta row (dates, request ref) ────────────────────────────
      {
        margin: [40, 24, 40, 0],
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              metaBox('Date Issued', fmtDate(po.created_at)),
              metaBox('Expected Delivery', fmtDate(po.expected_delivery_date)),
              metaBox('Linked Request', `#${request.request_number || '—'}`),
              metaBox('Raised By', raiser)
            ]
          ]
        },
        layout: metaLayout()
      },

      // ── Divider ──────────────────────────────────────────────────
      {
        margin: [40, 24, 40, 0],
        canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#dde4ef' }]
      },

      // ── Line items table ─────────────────────────────────────────
      {
        margin: [40, 20, 40, 0],
        table: {
          headerRows: 1,
          widths: ['*', 60, 90, 70, 90],
          body: [
            // Header row
            [
              tableHeader('ITEM / DESCRIPTION'),
              tableHeader('QTY', 'center'),
              tableHeader('UNIT', 'center'),
              tableHeader('UNIT PRICE', 'right'),
              tableHeader('AMOUNT', 'right')
            ],
            // Data row
            [
              {
                stack: [
                  { text: supply.name || '—', style: 'itemName' },
                  {
                    text: category.name ? `Category: ${category.name}` : '',
                    style: 'itemSub'
                  },
                  {
                    text: supply.description || '',
                    style: 'itemSub'
                  }
                ],
                margin: [6, 8, 6, 8]
              },
              { text: po.quantity, style: 'itemCell', alignment: 'center' },
              { text: supply.unit || 'Piece', style: 'itemCell', alignment: 'center' },
              { text: fmtMoney(po.unit_price), style: 'itemCell', alignment: 'right' },
              { text: fmtMoney(subtotal), style: 'itemCellBold', alignment: 'right' }
            ]
          ]
        },
        layout: itemsLayout()
      },

      // ── Totals block ─────────────────────────────────────────────
      {
        margin: [40, 16, 40, 0],
        columns: [
          // Notes (left)
          {
            width: '55%',
            stack: po.notes
              ? [
                  { text: 'Notes', style: 'sectionLabel' },
                  {
                    text: po.notes,
                    style: 'bodyText',
                    margin: [0, 4, 0, 0]
                  }
                ]
              : [{ text: '' }]
          },
          { width: '5%', text: '' },
          // Totals (right)
          {
            width: '40%',
            table: {
              widths: ['*', 'auto'],
              body: [
                [
                  { text: 'Subtotal', style: 'totalsLabel' },
                  { text: fmtMoney(subtotal), style: 'totalsVal' }
                ],
                [
                  { text: 'Tax', style: 'totalsLabel' },
                  { text: fmtMoney(tax), style: 'totalsVal' }
                ],
                [
                  {
                    text: 'Grand Total',
                    style: 'grandLabel',
                    fillColor: NAVY,
                    color: WHITE,
                    margin: [10, 10, 10, 10]
                  },
                  {
                    text: fmtMoney(grand),
                    style: 'grandVal',
                    fillColor: NAVY,
                    color: WHITE,
                    margin: [10, 10, 10, 10]
                  }
                ]
              ]
            },
            layout: totalsLayout()
          }
        ]
      },

      // ── Timeline ─────────────────────────────────────────────────
      //   {
      //     margin: [40, 28, 40, 0],
      //     stack: [
      //       { text: 'STATUS TIMELINE', style: 'sectionLabel', margin: [0, 0, 0, 10] },
      //       {
      //         columns: timelineSteps.map((step) => ({
      //           stack: [
      //             {
      //               canvas: [
      //                 {
      //                   type: 'ellipse',
      //                   x: 16,
      //                   y: 16,
      //                   r1: 14,
      //                   r2: 14,
      //                   color: step.done ? NAVY : '#e2e8f0'
      //                 },
      //                 step.done
      //                   ? {
      //                       type: 'polyline',
      //                       points: [
      //                         { x: 9, y: 16 },
      //                         { x: 14, y: 21 },
      //                         { x: 23, y: 11 }
      //                       ],
      //                       lineWidth: 2.5,
      //                       lineColor: WHITE,
      //                       closePath: false
      //                     }
      //                   : {
      //                       type: 'ellipse',
      //                       x: 16,
      //                       y: 16,
      //                       r1: 5,
      //                       r2: 5,
      //                       color: '#cbd5e1'
      //                     }
      //               ],
      //               width: 32,
      //               alignment: 'center'
      //             },
      //             {
      //               text: step.label,
      //               style: step.done ? 'timelineLabelDone' : 'timelineLabel',
      //               margin: [0, 4, 0, 0],
      //               alignment: 'center'
      //             },
      //             {
      //               text: step.date ? fmtDate(step.date) : '—',
      //               style: 'timelineDate',
      //               alignment: 'center'
      //             }
      //           ],
      //           alignment: 'center'
      //         }))
      //       }
      //     ]
      //   },

      // ── Signature area ────────────────────────────────────────────
      {
        margin: [40, 32, 40, 60],
        columns: [
          {
            width: '45%',
            stack: [
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 1, lineColor: '#94a3b8' }
                ]
              },
              { text: 'Authorised Signature', style: 'sigLabel', margin: [0, 6, 0, 0] },
              { text: 'Teinnovate Capital', style: 'sigName' }
            ]
          },
          { width: '10%', text: '' },
          {
            width: '45%',
            stack: [
              {
                canvas: [
                  { type: 'line', x1: 0, y1: 0, x2: 180, y2: 0, lineWidth: 1, lineColor: '#94a3b8' }
                ]
              },
              { text: 'Received By (Supplier)', style: 'sigLabel', margin: [0, 6, 0, 0] },
              { text: supplier.name || '', style: 'sigName' }
            ]
          }
        ]
      }
    ],

    // ── Footer ────────────────────────────────────────────────────
    footer(currentPage, pageCount) {
      return {
        margin: [40, 14, 40, 0],
        columns: [
          {
            text: 'Teinnovate Capital  ·  Lagos, Nigeria  ·  procurement@teinnovate.com',
            style: 'footerText'
          },
          {
            text: `Page ${currentPage} of ${pageCount}`,
            style: 'footerText',
            alignment: 'right'
          }
        ]
      }
    },

    // ── Styles ────────────────────────────────────────────────────
    styles: {
      headerDate: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.75)',
        margin: [0, 6, 0, 0]
      },
      logoFallback: {
        fontSize: 15,
        bold: true,
        color: WHITE,
        lineHeight: 1.3
      },
      headerTag: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.7)',
        letterSpacing: 3,
        bold: true,
        margin: [0, 0, 0, 4]
      },
      poNumber: {
        fontSize: 26,
        bold: true,
        color: WHITE,
        margin: [0, 0, 0, 6]
      },
      statusBadge: {
        fontSize: 10,
        bold: true,
        letterSpacing: 1
      },
      sectionLabel: {
        fontSize: 8,
        bold: true,
        color: GREY,
        letterSpacing: 2,
        margin: [0, 0, 0, 4]
      },
      companyName: {
        fontSize: 13,
        bold: true,
        color: DARK,
        margin: [0, 0, 0, 3]
      },
      bodyText: {
        fontSize: 9,
        color: GREY,
        lineHeight: 1.5
      },
      metaKey: {
        fontSize: 8,
        color: GREY,
        bold: true,
        letterSpacing: 1
      },
      metaVal: {
        fontSize: 10,
        color: DARK,
        bold: true,
        margin: [0, 3, 0, 0]
      },
      itemName: {
        fontSize: 10,
        bold: true,
        color: DARK
      },
      itemSub: {
        fontSize: 8,
        color: GREY,
        margin: [0, 2, 0, 0]
      },
      itemCell: {
        fontSize: 10,
        color: DARK,
        margin: [6, 8, 6, 8]
      },
      itemCellBold: {
        fontSize: 10,
        bold: true,
        color: NAVY,
        margin: [6, 8, 6, 8]
      },
      totalsLabel: {
        fontSize: 9,
        color: GREY,
        margin: [0, 6, 16, 6]
      },
      totalsVal: {
        fontSize: 9,
        color: DARK,
        bold: true,
        alignment: 'right',
        margin: [0, 6, 0, 6]
      },
      grandLabel: {
        fontSize: 11,
        bold: true
      },
      grandVal: {
        fontSize: 11,
        bold: true,
        alignment: 'right'
      },
      timelineLabelDone: {
        fontSize: 9,
        bold: true,
        color: NAVY
      },
      timelineLabel: {
        fontSize: 9,
        color: GREY
      },
      timelineDate: {
        fontSize: 8,
        color: GREY,
        margin: [0, 2, 0, 0]
      },
      sigLabel: {
        fontSize: 8,
        color: GREY,
        letterSpacing: 1
      },
      sigName: {
        fontSize: 9,
        bold: true,
        color: DARK,
        margin: [0, 2, 0, 0]
      },
      footerText: {
        fontSize: 8,
        color: 'rgba(255,255,255,0.65)'
      }
    },

    defaultStyle: {
      font: 'Roboto'
    }
  }
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function metaBox(key, val) {
  return {
    stack: [
      { text: key.toUpperCase(), style: 'metaKey' },
      { text: val || '—', style: 'metaVal' }
    ],
    margin: [10, 10, 10, 10]
  }
}

function metaLayout() {
  return {
    fillColor(rowIndex, node, colIndex) {
      return colIndex % 2 === 0 ? LGREY : STEEL
    },
    hLineWidth: () => 0,
    vLineWidth: () => 0,
    paddingLeft: () => 0,
    paddingRight: () => 0,
    paddingTop: () => 0,
    paddingBottom: () => 0
  }
}

function tableHeader(text, alignment = 'left') {
  return {
    text,
    fontSize: 8,
    bold: true,
    color: WHITE,
    fillColor: NAVY,
    alignment,
    margin: [6, 10, 6, 10],
    letterSpacing: 1
  }
}

function itemsLayout() {
  return {
    fillColor(rowIndex) {
      if (rowIndex === 0) return null // header already set
      return rowIndex % 2 === 0 ? LGREY : WHITE
    },
    hLineWidth(i, node) {
      return i === 0 || i === node.table.body.length ? 0 : 0.5
    },
    vLineWidth: () => 0,
    hLineColor: () => '#e2e8f0'
  }
}

function totalsLayout() {
  return {
    hLineWidth(i, node) {
      return i === 0 || i === node.table.body.length ? 0 : 0.5
    },
    vLineWidth: () => 0,
    hLineColor: () => '#e2e8f0'
  }
}
