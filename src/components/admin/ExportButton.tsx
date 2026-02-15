import { useState } from 'react';
import { Download, FileSpreadsheet, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { exportToExcel, exportToPDF } from '@/lib/export';
import { toast } from 'sonner';

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExportButtonProps {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: Record<string, any>[];
  filename: string;
}

export function ExportButton({ title, subtitle, columns, data, filename }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: 'excel' | 'pdf') => {
    if (data.length === 0) {
      toast.error('Nenhum dado para exportar');
      return;
    }
    setLoading(true);
    try {
      const opts = { title, subtitle, columns, data, filename };
      if (format === 'excel') {
        await exportToExcel(opts);
      } else {
        exportToPDF(opts);
      }
      toast.success(`Exportado com sucesso em ${format === 'excel' ? 'Excel' : 'PDF'}`);
    } catch (e) {
      toast.error('Erro ao exportar');
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={loading}>
          <Download className="w-4 h-4 mr-2" />
          {loading ? 'Exportando...' : 'Exportar'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('excel')}>
          <FileSpreadsheet className="w-4 h-4 mr-2 text-green-600" />
          Excel (.xlsx)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('pdf')}>
          <FileText className="w-4 h-4 mr-2 text-red-600" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
