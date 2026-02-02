import React from 'react';
import { hasPermission, hasAnyPermission, hasAllPermissions } from './roles';

/**
 * PermissionGate Component
 * Conditionally renders children based on user permissions
 * 
 * @param {string} userRole - The current user's role
 * @param {string|string[]} permissions - Required permission(s)
 * @param {string} requireAll - If true, requires all permissions. If false, requires any permission
 * @param {ReactNode} fallback - Optional fallback component when permission is denied
 */
export default function PermissionGate({ 
  userRole, 
  permissions, 
  requireAll = false, 
  fallback = null, 
  children 
}) {
  if (!userRole) return fallback;

  const permissionArray = Array.isArray(permissions) ? permissions : [permissions];
  
  const hasAccess = requireAll 
    ? hasAllPermissions(userRole, permissionArray)
    : hasAnyPermission(userRole, permissionArray);

  return hasAccess ? children : fallback;
}

/**
 * Hook for checking permissions
 */
export function usePermissions(userRole) {
  return {
    can: (permission) => hasPermission(userRole, permission),
    canAny: (permissions) => hasAnyPermission(userRole, permissions),
    canAll: (permissions) => hasAllPermissions(userRole, permissions),
  };
}