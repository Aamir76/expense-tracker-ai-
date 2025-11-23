import { Expense, ExpenseCategory } from './expense';

// V4 Core Types
export interface ExportService {
  id: string;
  name: string;
  version: string;
  status: 'active' | 'inactive' | 'maintenance';
  capabilities: ServiceCapability[];
}

export interface ServiceCapability {
  name: string;
  description: string;
  enabled: boolean;
  parameters?: Record<string, any>;
}

// Analytics Types
export interface ExpenseAnalytics {
  id: string;
  expenseId: string;
  trends: TrendData[];
  predictions: PredictionData[];
  insights: InsightData[];
  anomalies: AnomalyData[];
  createdAt: string;
  updatedAt: string;
}

export interface TrendData {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  category: ExpenseCategory;
  trend: 'increasing' | 'decreasing' | 'stable';
  percentage: number;
  confidence: number;
}

export interface PredictionData {
  type: 'spending' | 'category' | 'budget';
  value: number;
  timeframe: string;
  confidence: number;
  factors: string[];
}

export interface InsightData {
  id: string;
  type: 'optimization' | 'warning' | 'recommendation';
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  suggestions: string[];
}

export interface AnomalyData {
  id: string;
  expenseId: string;
  type: 'amount' | 'frequency' | 'category';
  severity: 'low' | 'medium' | 'high';
  description: string;
  detected: string;
}

// Collaboration Types
export interface WorkspaceUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'editor' | 'viewer';
  avatar?: string;
  isOnline: boolean;
  lastActive: string;
}

export interface CollaborativeWorkspace {
  id: string;
  name: string;
  description: string;
  users: WorkspaceUser[];
  permissions: WorkspacePermissions;
  settings: WorkspaceSettings;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspacePermissions {
  canExport: boolean;
  canEdit: boolean;
  canInvite: boolean;
  canDelete: boolean;
  accessLevel: 'public' | 'private' | 'restricted';
}

export interface WorkspaceSettings {
  autoSave: boolean;
  realTimeSync: boolean;
  exportHistory: boolean;
  aiInsights: boolean;
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  browser: boolean;
  slack: boolean;
  webhook?: string;
}

// Export Templates V4
export interface ExportTemplateV4 {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'business' | 'personal' | 'analytics' | 'compliance';
  version: string;
  schema: TemplateSchema;
  styling: TemplateStyling;
  automation: TemplateAutomation;
  permissions: TemplatePermissions;
  metadata: TemplateMetadata;
}

export interface TemplateSchema {
  fields: TemplateField[];
  grouping: GroupingConfig[];
  calculations: CalculationConfig[];
  filters: FilterConfig[];
}

export interface TemplateField {
  key: string;
  name: string;
  type: 'string' | 'number' | 'date' | 'category' | 'calculated';
  required: boolean;
  format?: string;
  validation?: ValidationRule[];
}

export interface GroupingConfig {
  field: string;
  type: 'sum' | 'count' | 'average' | 'min' | 'max';
  label: string;
}

export interface CalculationConfig {
  name: string;
  formula: string;
  description: string;
  dependencies: string[];
}

export interface FilterConfig {
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
  label: string;
}

export interface TemplateStyling {
  theme: 'light' | 'dark' | 'corporate' | 'minimal';
  colors: ColorScheme;
  fonts: FontConfig;
  layout: LayoutConfig;
}

export interface ColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  border: string;
}

export interface FontConfig {
  family: string;
  sizes: Record<string, string>;
  weights: Record<string, number>;
}

export interface LayoutConfig {
  orientation: 'portrait' | 'landscape';
  margins: Margins;
  spacing: SpacingConfig;
  branding: BrandingConfig;
}

export interface Margins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface SpacingConfig {
  section: number;
  item: number;
  paragraph: number;
}

export interface BrandingConfig {
  logo?: string;
  watermark?: string;
  footer?: string;
  header?: string;
}

export interface TemplateAutomation {
  scheduling: SchedulingConfig;
  triggers: TriggerConfig[];
  actions: ActionConfig[];
  workflows: WorkflowConfig[];
}

export interface SchedulingConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  time: string;
  timezone: string;
  conditions?: ConditionConfig[];
}

export interface TriggerConfig {
  id: string;
  type: 'expense_added' | 'threshold_reached' | 'date_reached' | 'anomaly_detected';
  conditions: ConditionConfig[];
  enabled: boolean;
}

export interface ConditionConfig {
  field: string;
  operator: string;
  value: any;
  logic?: 'and' | 'or';
}

export interface ActionConfig {
  id: string;
  type: 'export' | 'email' | 'webhook' | 'notification';
  configuration: Record<string, any>;
  enabled: boolean;
}

export interface WorkflowConfig {
  id: string;
  name: string;
  steps: WorkflowStep[];
  enabled: boolean;
}

export interface WorkflowStep {
  id: string;
  type: 'condition' | 'action' | 'delay';
  configuration: Record<string, any>;
  nextStep?: string;
}

export interface TemplatePermissions {
  public: boolean;
  shareable: boolean;
  editable: boolean;
  cloneable: boolean;
  marketplace: boolean;
}

export interface TemplateMetadata {
  author: string;
  version: string;
  tags: string[];
  downloads: number;
  rating: number;
  reviews: number;
  featured: boolean;
  lastUpdated: string;
}

export interface ValidationRule {
  type: 'required' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
  validator?: (value: any) => boolean;
}

// Export Job Types
export interface ExportJob {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  type: 'instant' | 'scheduled' | 'bulk';
  template: ExportTemplateV4;
  data: ExportDataConfig;
  output: ExportOutput;
  progress: ExportProgress;
  metadata: ExportJobMetadata;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export interface ExportDataConfig {
  source: 'expenses' | 'analytics' | 'insights' | 'workspace';
  filters: Record<string, any>;
  transformations: DataTransformation[];
  enrichment: DataEnrichment[];
}

export interface DataTransformation {
  type: 'filter' | 'map' | 'group' | 'aggregate' | 'sort';
  configuration: Record<string, any>;
}

export interface DataEnrichment {
  type: 'category_prediction' | 'anomaly_detection' | 'trend_analysis';
  enabled: boolean;
  configuration: Record<string, any>;
}

export interface ExportOutput {
  format: 'csv' | 'json' | 'pdf' | 'excel' | 'xml' | 'html';
  destination: 'download' | 'email' | 'cloud' | 'webhook';
  configuration: Record<string, any>;
  encryption?: EncryptionConfig;
}

export interface EncryptionConfig {
  enabled: boolean;
  algorithm: string;
  keyId?: string;
  password?: string;
}

export interface ExportProgress {
  percentage: number;
  stage: string;
  estimatedCompletion?: string;
  processedRecords: number;
  totalRecords: number;
  errors: ExportError[];
}

export interface ExportError {
  id: string;
  type: 'validation' | 'processing' | 'output' | 'system';
  message: string;
  details?: Record<string, any>;
  timestamp: string;
}

export interface ExportJobMetadata {
  userId: string;
  workspaceId?: string;
  fileSize?: number;
  recordCount: number;
  processingTime?: number;
  resourceUsage?: ResourceUsage;
}

export interface ResourceUsage {
  cpu: number;
  memory: number;
  storage: number;
  network: number;
}

// Plugin System Types
export interface ExportPlugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  category: 'format' | 'destination' | 'transformation' | 'analytics';
  status: 'active' | 'inactive' | 'deprecated';
  configuration: PluginConfiguration;
  permissions: PluginPermissions;
  metadata: PluginMetadata;
}

export interface PluginConfiguration {
  schema: Record<string, any>;
  defaults: Record<string, any>;
  required: string[];
  optional: string[];
}

export interface PluginPermissions {
  fileAccess: boolean;
  networkAccess: boolean;
  systemAccess: boolean;
  dataAccess: DataAccessLevel[];
}

export type DataAccessLevel = 'read' | 'write' | 'delete' | 'export';

export interface PluginMetadata {
  homepage?: string;
  repository?: string;
  documentation?: string;
  license: string;
  keywords: string[];
  compatibility: string[];
  size: number;
  downloads: number;
  rating: number;
}

// Real-time Types
export interface RealtimeEvent {
  id: string;
  type: string;
  payload: Record<string, any>;
  userId: string;
  workspaceId?: string;
  timestamp: string;
}

export interface RealtimeConnection {
  id: string;
  userId: string;
  workspaceId?: string;
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastPing: string;
  metadata: Record<string, any>;
}

// AI Types
export interface AIInsight {
  id: string;
  type: 'spending_pattern' | 'budget_optimization' | 'category_suggestion' | 'anomaly_alert';
  confidence: number;
  title: string;
  description: string;
  data: Record<string, any>;
  actionable: boolean;
  actions: AIAction[];
  createdAt: string;
}

export interface AIAction {
  id: string;
  label: string;
  type: 'apply_rule' | 'create_budget' | 'categorize' | 'export';
  configuration: Record<string, any>;
  autoApply: boolean;
}

export interface AIModel {
  id: string;
  name: string;
  type: 'classification' | 'regression' | 'clustering' | 'anomaly_detection';
  version: string;
  accuracy: number;
  lastTrained: string;
  parameters: Record<string, any>;
}