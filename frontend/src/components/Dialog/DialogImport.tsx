import React, { ChangeEvent, useRef, useState } from 'react';
import {
    Dialog, DialogActions, DialogContent, DialogTitle, Button, Typography, Box,
    styled, IconButton, Divider, Avatar, Link
} from '@mui/material';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import { IconDelete } from "../../components/Icon/IconDelete.tsx";
import { useLocale } from '@/utils/context/LocaleProvider';
import useExcelData from '@/hooks/app/useExcelData.tsx';

interface ImportDialogProps {
    open: boolean;
    onClose: () => void;
    setFile: (value: any) => void;
    handleImport: () => void
}

const buttonStyles = {
    width: '150px',
    height: '48px !important',
    px: 2,
    py: 1,
    borderWidth: '2px',
    borderRadius: '4px',
    fontWeight: 700,
};

const CancelButton = styled(Button)({
    color: '#5E697C',
    borderColor: '#5E697C',
    ...buttonStyles,
});

const SubmitButton = styled(Button)(({ theme }) => ({
    ...buttonStyles,
    color: theme.palette.common.white,
}));

const FileNameDisplay = styled('label')(({ theme }) =>({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    border: `2px dashed #39B54A`,
    height: '180px',
    width: '100%',
    cursor: 'pointer',
    borderRadius: '5px',
    backgroundColor: theme.color.background.o9,
    position: 'relative',
}));

const VisuallyHiddenInput = styled('input')({
    clip: 'rect(0 0 0 0)',
    clipPath: 'inset(50%)',
    height: 1,
    overflow: 'hidden',
    position: 'absolute',
    bottom: 0,
    left: 0,
    whiteSpace: 'nowrap',
    width: 1,
});

const StickyDialogActions = styled(DialogActions)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    height: '72px',
    backgroundColor: theme.color.background.o2,
    zIndex: 1,
    padding: theme.spacing(2),
}));

interface ConvertedRow {
    fullName: string;
    phone: string;
    ID: string;
}

const DialogImport: React.FC<ImportDialogProps> = ({ open, onClose, setFile, handleImport }) => {
    const { t } = useLocale();
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileInputKey, setFileInputKey] = useState(Date.now());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [error, setError] = useState<string | null>(null);
    const { readExcelFile } = useExcelData();

    const convertData = (data: any[][]): ConvertedRow[] => {
        const convertedRows: ConvertedRow[] = [];

        for (let i = 1; i < data.length; i++) {
            const row = data[i];
            const fullName = row[0];
            let phone = row[1];
            const ID = row[2];

            phone = phone?.toString() || '';

            const phoneValue = phone.replace(/[^0-9\-\(\)\s_]/g, '');

            if (phone !== phoneValue) {
                setError(`Invalid phone number at row ${i + 1}: Only numbers, hyphens (-), parentheses (()), spaces, and underscores (_) are allowed.`);
                return [];
            }

            convertedRows.push({
                fullName,
                phone: phoneValue,
                ID,
            });
        }

        setError(null);
        return convertedRows;
    };
    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        event.preventDefault();
        const file = event.target.files?.[0];
        convertExcel(file)
    };

    const handleDrop = async (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        const file = event.dataTransfer.files[0];
        convertExcel(file)
    };
    const convertExcel = async (file: File | undefined) => {
        if (file) {
            const rawData = await readExcelFile(file);
            const convertedData = convertData(rawData);

            if (convertedData.length > 0) {
                setSelectedFile(file);
                setFile(convertedData);
            } else {
                setSelectedFile(null);
                setFile(null);
            }
        }
    };
    const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
    };

    const removeFile = () => {
        setFile(null);
        setSelectedFile(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setFileInputKey(Date.now());
    };

    const handleDelete = () => {
        removeFile();
    };
    const handleSubmit = () => {
        if (selectedFile) {
            handleImport();
            handleDelete();
            setError("")
        } else {
            setError('File not exists')
        }

    }
    return (
        <Dialog open={open} onClose={onClose}>
            <Box sx={{ backgroundColor: (theme) => theme.color.background.o2 }}>
                <DialogTitle>
                    <Typography sx={{ fontSize: '24px', fontWeight: 600, color: (theme) => theme.color.text.o1 }}>
                        Import
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ width: '550px' }}>
                        <FileNameDisplay
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <VisuallyHiddenInput key={fileInputKey} ref={fileInputRef} id="fileInput" type="file" onChange={handleFileChange} />
                            <CloudUploadOutlinedIcon sx={{ color: (theme) => theme.color.text.o6, width: 48, height: 48 }} />
                            <Typography sx={{ color: (theme)=> theme.color.text.o1}}>Upload your files here</Typography>
                            <Divider sx={{ width: '30%', m: 1 }}>
                                <Avatar sx={{ backgroundColor: (theme) => theme.color.text.o1, color: (theme) => theme.color.background.o1, height: 33, width: 33, fontSize: '14px' }}>
                                    OR
                                </Avatar>
                            </Divider>
                            <Button
                                variant="outlined"
                                component="label"
                                sx={{ borderColor: (theme) => theme.color.text.o6, color: (theme) => theme.color.text.o6 }}
                            >
                                Browse file
                                <input
                                    type="file"
                                    hidden
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </FileNameDisplay>
                        {error && (
                            <Typography color="error" sx={{ mt: 2 }}>
                                {error}
                            </Typography>
                        )}
                    </Box>
                    {selectedFile && (
                        <Box display="flex" sx={{ backgroundColor: (theme) => theme.color.background.o5 }} justifyContent="space-between" alignItems="center" mt={2}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <AttachFileOutlinedIcon sx={{ color: (theme) => theme.color.text.o1}}/>
                                <Typography sx={{ fontSize: '16px', ml: 1, color: (theme) => theme.color.text.o1 }}>
                                    {selectedFile.name}
                                </Typography>
                            </Box>
                            <IconButton onClick={handleDelete} sx={{ color: (theme) => theme.color.text.o1 }}>
                                <IconDelete />
                            </IconButton>
                        </Box>
                    )}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-start',
                            justifyContent: 'center',
                            padding: '20px',
                            borderRadius: '10px',
                            backgroundColor: (theme) => theme.color.background.o7,
                            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                            maxWidth: '550px',
                            margin: '20px auto',
                        }}
                    >
                        <Box display="flex">
                            <Box flex={7} sx={{ textAlign: 'left' }}>
                                <Typography sx={{ fontSize: '18px', color: (theme) => theme.color.text.o1, marginBottom: '10px', fontWeight: '700' }}>
                                    Need help formatting your CSV Files
                                </Typography>
                                <Typography variant="body2" sx={{ fontSize: '16px', color: (theme) => theme.color.text.o5, marginBottom: '10px' }}>
                                    Download our pre-formatted CSV Template and follow the formatting for the best result.
                                </Typography>
                            </Box>
                            <Box flex={4} sx={{ textAlign: 'center', justifyContent: 'center', alignContent: 'center' }}>
                                <Link
                                    href={"/static/templates/fileFormat.xlsx"}
                                    sx={{ fontSize: '16px', color: '#39B54A', fontWeight: '600' }}
                                >
                                    Download template
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </DialogContent>
                <StickyDialogActions>
                    <CancelButton onClick={onClose} variant="outlined">
                        Cancel
                    </CancelButton>
                    <SubmitButton
                        onClick={handleSubmit}
                        variant="contained"
                        color="primary"
                    >
                        Import
                    </SubmitButton>
                </StickyDialogActions>
            </Box>
        </Dialog>
    );
};

export default DialogImport;