import { useRef } from 'react';
import { IconButton, useDisclosure, AlertDialog, AlertDialogOverlay, AlertDialogContent, AlertDialogHeader, AlertDialogBody, AlertDialogFooter, Button } from "@chakra-ui/react";
import { FaTrash } from "react-icons/fa";
import { Tooltip } from '@chakra-ui/react';


interface ClearCanvasProps {
  onClear: () => void;
}

export const ClearCanvas = ({ onClear }: ClearCanvasProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <>
     <Tooltip
          hasArrow
          label="Clear Workflow"
          aria-label="clear workflow tooltip"
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
        aria-label="Clear canvas"
        icon={<FaTrash />}
        size="xs"
        onClick={onOpen}
        variant="ghost"
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

      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Clear Workflow Canvas
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This will remove all nodes and edges from your current workflow.
              This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={() => {
                  onClear();
                  onClose();
                }}
                ml={3}
                bg="#665e92ff"
                _hover={{ bg: "#7a6fbb" }}
              >
                Clear Canvas
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};