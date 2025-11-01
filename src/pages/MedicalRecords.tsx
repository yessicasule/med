import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, ArrowLeft, Upload, Download, Trash2, Filter } from 'lucide-react';
import { useMedicalRecords } from '@/hooks/useMedicalRecords';
import Navbar from '@/components/Navbar';
import { format } from 'date-fns';

const MedicalRecords = () => {
  const navigate = useNavigate();
  const { records, isLoadingRecords, uploadRecord, deleteRecord, filterRecords } = useMedicalRecords();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [recordType, setRecordType] = useState<'prescription' | 'lab_report' | 'xray' | 'diagnosis' | 'other'>('prescription');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [filterType, setFilterType] = useState<string>('');

  const handleUpload = () => {
    if (!file || !title) return;

    uploadRecord({
      recordType,
      title,
      description,
      file,
    });

    setUploadDialogOpen(false);
    setTitle('');
    setDescription('');
    setFile(null);
  };

  const handleFilter = () => {
    filterRecords({
      recordType: filterType || undefined,
    });
  };

  const getRecordTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      prescription: 'bg-blue-500',
      lab_report: 'bg-green-500',
      xray: 'bg-purple-500',
      diagnosis: 'bg-orange-500',
      other: 'bg-gray-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type.replace('_', ' ')}</Badge>;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate('/patient/dashboard')} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Medical Records</h1>
            <p className="text-muted-foreground">Manage your medical records and documents</p>
          </div>
          <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Record
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Upload Medical Record</DialogTitle>
                <DialogDescription>Upload a prescription, lab report, or other medical document</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <Label>Record Type</Label>
                  <Select value={recordType} onValueChange={(value: any) => setRecordType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="lab_report">Lab Report</SelectItem>
                      <SelectItem value="xray">X-Ray</SelectItem>
                      <SelectItem value="diagnosis">Diagnosis</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter record title" />
                </div>
                <div>
                  <Label>Description (Optional)</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Enter description" />
                </div>
                <div>
                  <Label>File</Label>
                  <Input
                    type="file"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={!file || !title}>
                  Upload
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="shadow-card mb-6">
          <CardHeader>
            <CardTitle>Filter Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Record Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="prescription">Prescription</SelectItem>
                    <SelectItem value="lab_report">Lab Report</SelectItem>
                    <SelectItem value="xray">X-Ray</SelectItem>
                    <SelectItem value="diagnosis">Diagnosis</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleFilter}>
                  <Filter className="mr-2 h-4 w-4" />
                  Apply Filter
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader>
            <CardTitle>Your Medical Records</CardTitle>
            <CardDescription>View and manage your encrypted medical records</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecords ? (
              <div className="text-center py-8">Loading records...</div>
            ) : records.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No medical records found</p>
                <Button onClick={() => setUploadDialogOpen(true)}>Upload Your First Record</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.title}</TableCell>
                      <TableCell>{getRecordTypeBadge(record.recordType)}</TableCell>
                      <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{record.doctorName || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {record.fileName && (
                            <Button variant="outline" size="sm">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this record?')) {
                                deleteRecord(record.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicalRecords;
