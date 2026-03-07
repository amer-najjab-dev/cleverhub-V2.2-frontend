import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { saveAs } from 'file-saver';
import { CashClosure } from '../types/report.types';
import { ProductPrediction } from './productIntelligence.service';

export const exportService = {
  // ========== FUNCIONES EXISTENTES PARA CAISSE ==========
  
  async exportCashClosurePDF(closure: CashClosure) {
    const doc = new jsPDF();
    
    // Configurar fuente
    doc.setFont('helvetica');
    
    // Encabezado
    doc.setFontSize(20);
    doc.setTextColor(0, 51, 102);
    doc.text('Clôture de Caisse', 105, 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Pharmacie: ${closure.fiscalData.companyName}`, 20, 35);
    doc.text(`IF: ${closure.fiscalData.if} | ICE: ${closure.fiscalData.ice}`, 20, 42);
    
    const formattedDate = format(new Date(closure.date), 'dd/MM/yyyy');
    doc.text(`Date: ${formattedDate}`, 20, 49);
    
    doc.text(`Responsable: ${closure.user?.fullName || 'N/A'}`, 20, 56);
    
    // Resumen de ventas
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('Résumé des ventes', 20, 75);
    
    (doc as any).autoTable({
      startY: 80,
      head: [['Description', 'Montant (MAD)']],
      body: [
        ['Ventes brutes', closure.sales.grossSales.toFixed(2)],
        ['Remises', `-${closure.sales.discountTotal.toFixed(2)}`],
        ['Retours', `-${closure.sales.returnsTotal.toFixed(2)}`],
        ['Ventes nettes', closure.sales.netSales.toFixed(2)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 51, 102] },
    });
    
    // Desglose de IVA
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    (doc as any).autoTable({
      startY: finalY,
      head: [['TVA', 'Montant (MAD)']],
      body: [
        ['7%', closure.sales.vatBreakdown.vat7.toFixed(2)],
        ['10%', closure.sales.vatBreakdown.vat10.toFixed(2)],
        ['14%', closure.sales.vatBreakdown.vat14.toFixed(2)],
        ['20%', closure.sales.vatBreakdown.vat20.toFixed(2)],
        ['Exonéré', closure.sales.vatBreakdown.vatExempt.toFixed(2)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [0, 102, 51] },
    });
    
    // Medios de pago
    const paymentY = (doc as any).lastAutoTable.finalY + 10;
    
    (doc as any).autoTable({
      startY: paymentY,
      head: [['Mode de paiement', 'Montant (MAD)']],
      body: [
        ['Espèces', closure.payments.cash.toFixed(2)],
        ['Carte bancaire', closure.payments.card.toFixed(2)],
        ['Virement', closure.payments.transfer.toFixed(2)],
        ['Chèque', closure.payments.check.toFixed(2)],
        ['Crédit', closure.payments.credit.toFixed(2)],
        ['Mixte', closure.payments.mixed.toFixed(2)],
      ],
      theme: 'striped',
      headStyles: { fillColor: [102, 51, 0] },
    });
    
    // Auditoría de caja
    const auditY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFontSize(14);
    doc.setTextColor(0, 51, 102);
    doc.text('Audit de caisse', 20, auditY);
    
    (doc as any).autoTable({
      startY: auditY + 5,
      body: [
        ['Fond initial', closure.cashAudit.initialFund.toFixed(2)],
        ['Caisse attendue', closure.cashAudit.expectedCash.toFixed(2)],
        ['Caisse réelle', closure.cashAudit.actualCash.toFixed(2)],
        ['Écart', closure.cashAudit.discrepancy.toFixed(2)],
      ],
      theme: 'plain',
      styles: { fontSize: 11 },
    });
    
    // Firma
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text('Signature du responsable:', 20, (doc as any).lastAutoTable.finalY + 20);
    doc.text('Cachet de la pharmacie:', 120, (doc as any).lastAutoTable.finalY + 20);
    
    // Guardar PDF
    doc.save(`cloture_caisse_${formattedDate.replace(/\//g, '-')}.pdf`);
  },

  async exportCashClosureExcel(closure: CashClosure) {
    const workbook = XLSX.utils.book_new();
    
    // Hoja de ventas
    const salesData = [
      ['Description', 'Montant (MAD)'],
      ['Ventes brutes', closure.sales.grossSales],
      ['Remises', closure.sales.discountTotal],
      ['Retours', closure.sales.returnsTotal],
      ['Ventes nettes', closure.sales.netSales],
    ];
    
    const salesSheet = XLSX.utils.aoa_to_sheet(salesData);
    XLSX.utils.book_append_sheet(workbook, salesSheet, 'Ventes');
    
    // Hoja de IVA
    const vatData = [
      ['Taux TVA', 'Montant (MAD)'],
      ['7%', closure.sales.vatBreakdown.vat7],
      ['10%', closure.sales.vatBreakdown.vat10],
      ['14%', closure.sales.vatBreakdown.vat14],
      ['20%', closure.sales.vatBreakdown.vat20],
      ['Exonéré', closure.sales.vatBreakdown.vatExempt],
    ];
    
    const vatSheet = XLSX.utils.aoa_to_sheet(vatData);
    XLSX.utils.book_append_sheet(workbook, vatSheet, 'TVA');
    
    // Hoja de pagos
    const paymentData = [
      ['Mode de paiement', 'Montant (MAD)'],
      ['Espèces', closure.payments.cash],
      ['Carte bancaire', closure.payments.card],
      ['Virement', closure.payments.transfer],
      ['Chèque', closure.payments.check],
      ['Crédit', closure.payments.credit],
      ['Mixte', closure.payments.mixed],
    ];
    
    const paymentSheet = XLSX.utils.aoa_to_sheet(paymentData);
    XLSX.utils.book_append_sheet(workbook, paymentSheet, 'Paiements');
    
    const formattedDate = format(new Date(closure.date), 'yyyy-MM-dd');
    XLSX.writeFile(workbook, `cloture_caisse_${formattedDate}.xlsx`);
  },

  // ========== NUEVAS FUNCIONES PARA PRODUCTOS ==========

  // Exportar a Excel
  toExcel: (predictions: ProductPrediction[], filename: string = 'previsions-produits') => {
    const data = predictions.map(p => ({
      'Produit': p.productName,
      'Laboratoire': p.laboratory || '-',
      'Catégorie': p.category,
      'Stock actuel': p.currentStock,
      'Demande prévue (30j)': p.predictedDemandNext30Days,
      'Commande recommandée': p.recommendedOrder,
      'Facteur saisonnier': p.seasonalFactor.toFixed(2),
      'Ventes réelles (30j)': p.realSalesLast30Days,
      'Confiance': p.confidence + '%',
      'Source': p.predictionSource === 'real' ? 'Réelle' : p.predictionSource === 'hybrid' ? 'Hybride' : 'Marché'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Prévisions');
    
    // Ajustar ancho de columnas
    const colWidths = [
      { wch: 40 }, // Produit
      { wch: 20 }, // Laboratoire
      { wch: 20 }, // Catégorie
      { wch: 12 }, // Stock
      { wch: 18 }, // Demande
      { wch: 18 }, // Commande
      { wch: 15 }, // Facteur
      { wch: 18 }, // Ventes réelles
      { wch: 10 }, // Confiance
      { wch: 10 }, // Source
    ];
    ws['!cols'] = colWidths;

    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `${filename}.xlsx`);
  },

  // Exportar a PDF
  toPDF: (predictions: ProductPrediction[], filename: string = 'previsions-produits') => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text('Prévisions de demande - Produits', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Généré le ${format(new Date(), 'dd/MM/yyyy à HH:mm')}`, 14, 30);

    // Resumen de estadísticas
    const totalDemand = predictions.reduce((sum, p) => sum + p.predictedDemandNext30Days, 0);
    const totalInvestment = predictions.reduce((sum, p) => sum + p.recommendedOrder, 0);
    const productsWithStock = predictions.filter(p => p.currentStock > 0).length;
    const productsToOrder = predictions.filter(p => p.recommendedOrder > 0).length;

    doc.setFontSize(11);
    doc.setTextColor(0);
    doc.text(`Total produits analysés: ${predictions.length}`, 14, 40);
    doc.text(`Produits en stock: ${productsWithStock}`, 14, 47);
    doc.text(`Produits à commander: ${productsToOrder}`, 14, 54);
    doc.text(`Demande totale prévue: ${totalDemand} unités`, 14, 61);
    doc.text(`Investissement recommandé: ${totalInvestment} unités`, 14, 68);

    // Tabla de datos
    const tableData = predictions.map(p => [
      p.productName.substring(0, 30) + (p.productName.length > 30 ? '...' : ''),
      p.laboratory || '-',
      p.currentStock.toString(),
      p.predictedDemandNext30Days.toString(),
      p.recommendedOrder > 0 ? `+${p.recommendedOrder}` : '-',
      p.seasonalFactor.toFixed(2) + 'x',
      p.confidence + '%',
      p.predictionSource === 'real' ? 'Réelle' : p.predictionSource === 'hybrid' ? 'Hybride' : 'Marché'
    ]);

    (doc as any).autoTable({
      head: [['Produit', 'Laboratoire', 'Stock', 'Demande 30j', 'Recommandé', 'Saison', 'Confiance', 'Source']],
      body: tableData,
      startY: 75,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [249, 250, 251] },
      margin: { top: 40 }
    });

    doc.save(`${filename}.pdf`);
  },

  // Exportar gráfico (requiere html2canvas)
  toPNG: async (chartId: string, filename: string = 'graphique-saisonnier') => {
    try {
      const html2canvas = (await import('html2canvas')).default;
      const chartElement = document.getElementById(chartId);
      
      if (!chartElement) {
        console.error('Élément graphique non trouvé');
        return;
      }

      const canvas = await html2canvas(chartElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        allowTaint: false,
        useCORS: true
      });
      
      canvas.toBlob((blob) => {
        if (blob) {
          saveAs(blob, `${filename}.png`);
        }
      });
    } catch (error) {
      console.error('Erreur lors de l\'export du graphique:', error);
    }
  },

  // Exportar datos filtrados con formato personalizado
  toCustomExcel: (predictions: ProductPrediction[], columns: string[], filename: string = 'export-produits') => {
    const columnMap: Record<string, keyof ProductPrediction> = {
      'Produit': 'productName',
      'Laboratoire': 'laboratory',
      'Catégorie': 'category',
      'Stock': 'currentStock',
      'Demande': 'predictedDemandNext30Days',
      'Commande': 'recommendedOrder',
      'Facteur': 'seasonalFactor',
      'Confiance': 'confidence',
    };

    const data = predictions.map(p => {
      const row: any = {};
      columns.forEach(col => {
        const key = columnMap[col];
        if (key) {
          let value = p[key];
          if (key === 'confidence') value = value + '%';
          if (key === 'seasonalFactor') value = (value as number).toFixed(2) + 'x';
          row[col] = value;
        }
      });
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Export');
    
    XLSX.writeFile(wb, `${filename}.xlsx`);
  }
};