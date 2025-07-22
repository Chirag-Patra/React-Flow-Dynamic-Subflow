import { IconButton } from "@chakra-ui/react";
import { useRef } from "react";
import { BiImport } from "react-icons/bi";
import { Tooltip } from '@chakra-ui/react';

interface ImportFlowProps {
    onImport: (flow: { nodes: any[]; edges: any[] }) => void;
}

export const ImportFlow = ({ onImport }: ImportFlowProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const fileInput = event.target;
        const file = fileInput.files?.[0];

        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const flow = JSON.parse(e.target?.result as string);
                if (flow.nodes && flow.edges) {
                    onImport(flow);
                } else {
                    alert('Invalid workflow file format');
                }
            } catch (error) {
                alert('Error parsing workflow file');
                console.error(error);
            }
            // Reset the file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    return (
        <>
            <Tooltip
                hasArrow
                label="Import Workflow"
                aria-label="Import workflow tooltip"
                placement="bottom"
                bg="blue.500"
                color="white"
                borderRadius="md"
                py={1}
                px={2}
                openDelay={300}
                transition="all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55)"
                _hover={{
                    transform: 'translateY(-2px)',
                    boxShadow: 'lg'
                }}
            >
                <IconButton
                    icon={<BiImport style={{ fontWeight: 'bold' }} />}
                    aria-label="Export"
                    size="xs"
                    onClick={() => fileInputRef.current?.click()}
                    sx={{
                        // Base gradient styling
                        height: '32px',
                        width: '32px',
                        bgGradient: 'linear-gradient(to right, #4f46e5, #af78cfff)',
                        color: 'white',
                        borderRadius: 'md',
                        border: 'none',
                        fontWeight: 'bold',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        boxShadow: 'md',
                        position: 'relative',
                        overflow: 'hidden',

                        // Gradient animation on hover
                        _hover: {
                            bgGradient: 'linear(to-r, blue.500, teal.400)',
                            transform: 'translateY(-2px)',
                            boxShadow: 'lg',
                            '&::before': {
                                content: '""',
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                bgGradient: 'linear-gradient(to right, #4f46e5, #af78cfff)',
                            }
                        },
                        // Icon styling
                        '& svg': {
                            width: '16px',
                            height: '16px',
                            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.2))',
                            transition: 'transform 0.2s ease-out',
                        },

                        // Icon animation on hover
                        '&:hover svg': {
                            transform: 'scale(1.15)',
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        },

                        // Pulse animation (optional)
                        animation: 'pulse 5s infinite',
                        '@keyframes pulse': {
                            '0%': { boxShadow: '0 0 0 0 rgba(49, 151, 149, 0.7)' },
                            '70%': { boxShadow: '0 0 0 10px rgba(49, 151, 149, 0)' },
                            '100%': { boxShadow: '0 0 0 0 rgba(49, 151, 149, 0)' },
                        }
                    }}
                />
            </Tooltip>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleImport}
                accept=".json"
                style={{ display: 'none' }}
            />
        </>
    );
};