// Re-export existing hooks
export { default as useHistory } from './useHistory';
export { default as useKeyBindings } from './useKeyBindings';

// Export new optimized hooks
export * from './useThemeHooks';
export * from './useNodeHooks';
export * from './useComponentHooks';