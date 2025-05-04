import { usePathname } from 'next/navigation';

// Define the types of pages that can have context
export type PageType = 'dashboard' | 'recipes' | 'meal-plan' | 'shopping-list';

// Enhanced configuration for page context rules
export interface PageContextConfig {
  type: PageType;
  path: string;
  hasDetailView?: boolean;
  detailPath?: string;
  // Optional custom context provider for complex pages
  getContext?: (id: string | undefined) => Promise<Record<string, any>>;
  // Optional validation for IDs
  validateId?: (id: string) => boolean;
  // Optional nested routes configuration
  nestedRoutes?: {
    path: string;
    type: string;
  }[];
}

// Utility function to convert Next.js dynamic route pattern to regex
const pathToRegex = (path: string): RegExp => {
  return new RegExp(`^${path.replace(/\[([^\]]+)\]/g, '([^/]+)')}$`);
};

// Utility function to validate configurations
export const validateConfigs = (configs: PageContextConfig[]): void => {
  const paths = new Set<string>();
  
  configs.forEach(config => {
    if (paths.has(config.path)) {
      throw new Error(`Duplicate path found: ${config.path}`);
    }
    paths.add(config.path);
    
    if (config.hasDetailView && !config.detailPath) {
      throw new Error(`Detail view enabled but no detailPath provided for ${config.type}`);
    }
    
    if (config.detailPath && !config.hasDetailView) {
      throw new Error(`Detail path provided but hasDetailView is false for ${config.type}`);
    }
  });
};

export const pageContextConfigs: PageContextConfig[] = [
  {
    type: 'dashboard',
    path: '/dashboard',
    hasDetailView: false,
    getContext: async () => ({ dashboard: true })
  },
  {
    type: 'recipes',
    path: '/recipes',
    hasDetailView: true,
    detailPath: '/recipes/[id]',
    validateId: (id) => /^[a-f0-9-]+$/.test(id), // Example UUID validation
    getContext: async (id) => {
      if (!id) return { recipeList: true };
      // In a real implementation, you would fetch the recipe context here
      return { recipeId: id };
    }
  },
  {
    type: 'meal-plan',
    path: '/meal-plan',
    hasDetailView: true,
    detailPath: '/meal-plan/[id]',
    nestedRoutes: [
      { path: '/meal-plan/[id]/edit', type: 'meal-plan-edit' }
    ]
  },
  {
    type: 'shopping-list',
    path: '/shopping-list',
    hasDetailView: true,
    detailPath: '/shopping-list/[id]'
  }
];

// Validate configurations on module load
validateConfigs(pageContextConfigs);

export interface ChatContext {
  type: PageType | undefined;
  id: string | undefined;
  additionalContext?: Record<string, any>;
}

export const useChatContext = (): ChatContext => {
  const pathname = usePathname();

  // Handle root path
  if (pathname === '/') {
    return { type: 'dashboard', id: undefined };
  }

  // Check each configured page type
  for (const config of pageContextConfigs) {
    // Check for list view
    if (pathname === config.path) {
      return { type: config.type, id: undefined };
    }

    // Check for detail view if configured
    if (config.hasDetailView && config.detailPath) {
      const regex = pathToRegex(config.detailPath);
      const match = pathname.match(regex);
      if (match) {
        const id = match[1];
        // Validate ID if validator is provided
        if (config.validateId && !config.validateId(id)) {
          console.warn(`Invalid ID format for ${config.type}: ${id}`);
          continue;
        }
        return { type: config.type, id };
      }
    }

    // Check nested routes if configured
    if (config.nestedRoutes) {
      for (const nestedRoute of config.nestedRoutes) {
        const regex = pathToRegex(nestedRoute.path);
        const match = pathname.match(regex);
        if (match) {
          return { type: nestedRoute.type as PageType, id: match[1] };
        }
      }
    }
  }

  // Default case
  return { type: undefined, id: undefined };
};

export const getAdditionalContext = async (type: PageType | undefined, id: string | undefined): Promise<Record<string, any>> => {
  if (!type) return {};

  const config = pageContextConfigs.find(c => c.type === type);
  if (!config?.getContext) return {};

  try {
    return await config.getContext(id);
  } catch (error) {
    console.error('Error fetching additional context:', error);
    return {};
  }
}; 