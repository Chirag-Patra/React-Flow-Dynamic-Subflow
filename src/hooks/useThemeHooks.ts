import { useCallback, useMemo } from 'react';
import { useDarkMode } from '../store';

// Constants for theme colors to prevent recalculation
const THEME_COLORS = {
  light: {
    base: 'black',
    drag: { default: '#3182ce', background: 'rgba(49, 130, 206, 0.15)' },
    board: 'rgba(173, 216, 230, 0.3)',
    modal: {
      bgColor: '#F7FAFC',
      borderColor: '#E2E8F0', 
      accentColor: '#3182CE',
      textColor: '#2D3748',
      cardBg: '#FFFFFF',
      cardHoverBg: '#F7FAFC',
    }
  },
  dark: {
    base: 'white',
    drag: { default: '#4299e1', background: 'rgba(66, 153, 225, 0.15)' },
    board: 'rgba(100, 150, 200, 0.15)',
    modal: {
      bgColor: '#2D3748',
      borderColor: '#4A5568',
      accentColor: '#63B3ED', 
      textColor: '#E2E8F0',
      cardBg: '#1A202C',
      cardHoverBg: '#2D3748',
    }
  }
} as const;

/**
 * Hook for optimized theme color calculations
 * Returns memoized color values based on current theme and drag state
 */
export function useThemeColors(isDragOver = false) {
  const { isDark } = useDarkMode();

  return useMemo(() => {
    const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
    const dragTheme = isDragOver ? theme.drag : null;

    return {
      baseColor: theme.base,
      borderColor: dragTheme?.default ?? theme.base,
      bgColor: dragTheme?.background ?? theme.board,
      modal: theme.modal,
      // Convenience getters for common patterns
      getCardColor: (isHovered: boolean) => isHovered ? theme.modal.cardHoverBg : theme.modal.cardBg,
      getBorderStyle: (isSelected: boolean) => ({
        borderColor: isSelected ? theme.modal.accentColor : theme.modal.borderColor,
        borderWidth: isSelected ? '2px' : '1px'
      })
    };
  }, [isDark, isDragOver]);
}

/**
 * Hook for managing component styling states
 * Returns memoized style objects for different component states
 */
export function useComponentStyling(
  isSelected: boolean,
  isAdditionValid?: boolean,
  isAdditionInvalid?: boolean
) {
  const { isDark } = useDarkMode();

  return useMemo(() => {
    const backgroundColor = isAdditionValid ? '#58ed58' :
                          isAdditionInvalid ? '#ff0505' :
                          isSelected ? (isDark ? 'gray.700' : 'gray.200') :
                          (isDark ? 'gray.800' : 'gray.100');

    const borderColor = isSelected ? 'blue.500' : (isDark ? 'gray.600' : 'gray.300');
    const borderWidth = isSelected ? '2px' : '1px';

    return {
      backgroundColor,
      borderColor, 
      borderWidth,
      hoverStyles: {
        boxShadow: 'md',
        bg: isDark ? 'gray.700' : 'gray.200'
      }
    };
  }, [isSelected, isAdditionValid, isAdditionInvalid, isDark]);
}

/**
 * Hook for debounced callbacks to improve performance
 * Useful for expensive operations like ResizeObserver updates
 */
export function useDebouncedCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  return useCallback((...args: Parameters<T>) => {
    const timeoutId = setTimeout(() => {
      callback(...args);
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [callback, delay]);
}

/**
 * Hook for optimized drag and drop state management
 */
export function useDragDropState() {
  const { isDark } = useDarkMode();

  const getDragColors = useCallback((isDragOver: boolean) => {
    const theme = isDark ? THEME_COLORS.dark : THEME_COLORS.light;
    
    return {
      borderColor: isDragOver ? theme.drag.default : theme.base,
      backgroundColor: isDragOver ? theme.drag.background : theme.board
    };
  }, [isDark]);

  return { getDragColors };
}