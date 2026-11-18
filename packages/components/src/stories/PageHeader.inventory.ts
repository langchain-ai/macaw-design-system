// Static source audit of langchainplus/smith-frontend at 9fe14ad5780.
// Product entities in the visual examples are fictional. No product code is imported.

export interface SettingsHeaderExample {
  title: string;
  description?: string;
  actions: string[];
  docs?: boolean;
  badge?: string;
  badgeColor?: 'primary' | 'secondary';
  trailing?: 'export' | 'data-plane' | 'unshare' | 'health';
  sources: string[];
}

export const settingsHeaders: SettingsHeaderExample[] = [
  {
    title: 'Commit Webhooks',
    description:
      'Notify external services when a Context Hub commit is created.',
    actions: ['Webhook'],
    sources: ['Pages/Context/components/Webhooks/ContextHubWebhooks.tsx:136'],
  },
  {
    title: 'Deployment listeners',
    description: 'Background services that manage self-hosted deployments',
    actions: ['Listener'],
    sources: ['Pages/HostListeners/HostListeners.tsx:88'],
  },
  {
    title: 'Access Policies',
    description:
      'Attribute-based access control (ABAC) policies for this organization.',
    actions: [],
    sources: ['Pages/Settings/ABAC/ABAC.tsx:43'],
  },
  {
    title: 'My Account',
    description:
      'Your personal profile and preferences across organizations and workspaces.',
    actions: [],
    sources: ['Pages/Settings/AccountSettings.tsx:54'],
  },
  {
    title: 'Audit Logs',
    description: 'A record of write operations performed in this organization.',
    actions: [],
    sources: ['Pages/Settings/AuditLogs/AuditLogs.tsx:284'],
  },
  {
    title: 'Deprecated API Usage',
    actions: [],
    trailing: 'export',
    sources: ['Pages/Settings/DeprecatedApiUsage/DeprecatedApiUsage.tsx:176'],
  },
  {
    title: 'Engine Model Providers',
    description:
      'Engine on LangSmith Cloud uses LangSmith Intelligence. Pick a BYOC data plane.',
    actions: [],
    sources: [
      'Pages/Settings/EngineModelProviders/EngineModelProviders.tsx:82',
    ],
  },
  {
    title: 'Engine Model Providers',
    description:
      'Choose which model providers Engine may use on the selected data plane.',
    actions: [],
    sources: [
      'Pages/Settings/EngineModelProviders/EngineModelProviders.tsx:126',
    ],
  },
  {
    title: 'Usage Export',
    description: 'Export usage data for manual submission to LangChain.',
    actions: [],
    sources: ['Pages/Settings/EnterpriseOrgUsageV2.tsx:186'],
  },
  {
    title: 'Instance',
    description:
      'Health of the services behind this self-hosted install, sampled every minute.',
    actions: [],
    trailing: 'health',
    sources: ['Pages/Settings/Instance/InstancePage.tsx:272'],
  },
  {
    title: 'Organization Members',
    actions: [],
    sources: ['Pages/Settings/Members/OrgMembersPage.tsx:12'],
  },
  {
    title: 'Organization Members',
    description:
      'Organization roles apply to every workspace. Workspace roles apply to just one.',
    actions: ['Invite members'],
    docs: true,
    trailing: 'export',
    sources: ['Pages/Settings/Members/components/MembersPageHeader.tsx:24'],
  },
  {
    title: 'Workspace Members',
    description:
      'Workspace roles apply only here. Organization Admins are admins everywhere.',
    actions: ['Invite members'],
    docs: true,
    trailing: 'export',
    sources: ['Pages/Settings/Members/components/MembersPageHeader.tsx:24'],
  },
  {
    title: 'Models',
    actions: [],
    trailing: 'data-plane',
    sources: ['Pages/Settings/ModelConfigurations/ModelConfigurations.tsx:42'],
  },
  {
    title: 'Feature Access',
    description:
      'Choose the providers, models, and default model each feature can use.',
    actions: [],
    trailing: 'data-plane',
    sources: ['Pages/Settings/ModelConfigurations/ModelConfigurations.tsx:42'],
  },
  {
    title: 'AI Features',
    actions: [],
    sources: ['Pages/Settings/OrganizationAiFeatures.tsx:67'],
  },
  {
    title: 'API Keys',
    description:
      'API keys can’t be viewed after creation. Store them somewhere safe.',
    actions: ['API Key'],
    docs: true,
    sources: ['Pages/Settings/OrganizationApiKeys.tsx:219'],
  },
  {
    title: 'Data Planes',
    description: 'Data planes host your sensitive data in your cloud.',
    actions: ['Data plane'],
    sources: ['Pages/Settings/OrganizationDataPlanes.tsx:363'],
  },
  {
    title: 'Feedback Tags',
    actions: ['Feedback tag'],
    sources: ['Pages/Settings/OrganizationFeedbackConfigsV2.tsx:422'],
  },
  {
    title: 'Enforced Feedback Tags',
    actions: ['Feedback tag'],
    sources: ['Pages/Settings/OrganizationFeedbackConfigsV2.tsx:422'],
  },
  {
    title: 'Organization',
    actions: [],
    sources: ['Pages/Settings/OrganizationGeneral.tsx:354'],
  },
  {
    title: 'Membership Policies',
    actions: [],
    sources: ['Pages/Settings/OrganizationGeneral.tsx:354'],
  },
  {
    title: 'Security Policies',
    actions: [],
    sources: ['Pages/Settings/OrganizationGeneral.tsx:354'],
  },
  {
    title: 'LLM Auth Proxy',
    actions: [],
    sources: ['Pages/Settings/OrganizationGeneral.tsx:354'],
  },
  {
    title: 'Identity Providers',
    description:
      'Let developers call the LLM Gateway with a provider token instead of an API key.',
    actions: [],
    sources: ['Pages/Settings/OrganizationGeneral.tsx:354'],
  },
  {
    title: 'Organization Integrations',
    actions: [],
    sources: ['Pages/Settings/OrganizationGeneral.tsx:354'],
  },
  {
    title: 'Roles',
    description:
      'Role-based access control (RBAC): each role grants a fixed set of permissions.',
    actions: ['Role'],
    sources: ['Pages/Settings/OrganizationMembers.tsx:97'],
  },
  {
    title: 'Roles',
    actions: [],
    sources: ['Pages/Settings/OrganizationMembers.tsx:214'],
  },
  {
    title: 'Model Providers',
    description:
      'Choose which model providers are enabled across the organization.',
    actions: [],
    sources: ['Pages/Settings/OrganizationModelProviders.tsx:190'],
  },
  {
    title: 'Model Pricing',
    description:
      'Prices LangSmith uses to calculate the cost of traced model calls.',
    actions: ['Model'],
    docs: true,
    sources: ['Pages/Settings/OrganizationModels.tsx:184'],
  },
  {
    title: 'OAuth Applications',
    description:
      'Apps that let users sign in with LangSmith and call the API on their behalf.',
    actions: ['Application'],
    badge: 'Beta',
    sources: ['Pages/Settings/OrganizationOAuthApplications.tsx:415'],
  },
  {
    title: 'OAuth Providers',
    description:
      'Let agents authenticate with external services on behalf of users.',
    actions: ['Provider'],
    badge: 'Beta',
    sources: ['Pages/Settings/OrganizationOAuthProviders.tsx:308'],
  },
  {
    title: 'Plans and Pricing',
    actions: [],
    sources: ['Pages/Settings/OrganizationPlansAndBillingV2.tsx:101'],
  },
  {
    title: 'Resource Tags',
    description:
      'Organize traces, datasets, and other resources in this workspace.',
    actions: ['New tag'],
    docs: true,
    sources: ['Pages/Settings/OrganizationResourceTags.tsx:104'],
  },
  {
    title: 'Organization SSO',
    actions: [],
    sources: ['Pages/Settings/OrganizationSSOConfiguration.tsx:668'],
  },
  {
    title: 'Organization Secrets',
    description: 'Server-side secrets used across LangSmith.',
    actions: ['Secret'],
    trailing: 'data-plane',
    sources: ['Pages/Settings/OrganizationSecrets.tsx:309'],
  },
  {
    title: 'Workspace Secrets',
    description: 'Server-side secrets used across LangSmith.',
    actions: ['Secret'],
    sources: ['Pages/Settings/OrganizationSecrets.tsx:309'],
  },
  {
    title: 'Shared Links',
    description: 'Unsharing breaks the link for anyone who already has it.',
    actions: [],
    trailing: 'unshare',
    sources: ['Pages/Settings/OrganizationSharedV2.tsx:384'],
  },
  {
    title: 'AI Search',
    description:
      'Find traces by topic in natural language, using LangChain-managed inference.',
    actions: [],
    badge: 'Beta',
    badgeColor: 'primary',
    sources: ['Pages/Settings/OrganizationTopicSearch.tsx:86'],
  },
  {
    title: 'LangChain Tuned Evaluators',
    description:
      'Ready-to-use LLM judges tuned by LangChain. No setup, prompts, or API keys.',
    actions: [],
    sources: ['Pages/Settings/OrganizationTunedEvaluators.tsx:108'],
  },
  {
    title: 'Usage Graph',
    actions: [],
    sources: ['Pages/Settings/OrganizationUsage.tsx:38'],
  },
  {
    title: 'Trace Usage Limits',
    actions: [],
    sources: ['Pages/Settings/PlansAndBillingV2/UsageLimitsPage.tsx:53'],
  },
  {
    title: 'Trace Usage Limits',
    description: 'Set usage limits for your workspace.',
    actions: [],
    sources: ['Pages/Settings/PlansAndBillingV2/UsageLimitsPage.tsx:66'],
  },
  {
    title: 'Trace Usage Limits',
    description: 'Set usage limits for your organization.',
    actions: [],
    sources: ['Pages/Settings/PlansAndBillingV2/UsageLimitsPage.tsx:80'],
  },
  {
    title: 'SCIM Tokens',
    description:
      'Generate a token so your identity provider can provision users via SCIM.',
    actions: ['SCIM token'],
    docs: true,
    sources: ['Pages/Settings/ScimTokens/ScimTokens.tsx:337'],
  },
  {
    title: 'Shadow Deployments',
    description:
      'Internal only. Test a candidate deployment against customer projects.',
    actions: ['Create shadow deployment'],
    sources: ['Pages/Settings/ShadowDeployments.tsx:105'],
  },
  {
    title: 'Tunnels',
    description:
      'Reach private services from LangSmith without exposing them to the public internet.',
    actions: ['Tunnel'],
    sources: ['Pages/Settings/Tunnels/ConnectionsPage.tsx:149'],
  },
  {
    title: 'Relays',
    description:
      'Send traffic from LangSmith out through a connector in your own network.',
    actions: ['Relay'],
    sources: ['Pages/Settings/Tunnels/ConnectionsPage.tsx:149'],
  },
  {
    title: 'User Groups',
    description:
      'User groups group members so they share workspace access and access policies.',
    actions: ['Create user group'],
    sources: [
      'Pages/Settings/UserGroups/components/UserGroupsPageLayout.tsx:29',
      'Pages/Settings/UserGroups/OrganizationUserGroupsPage.tsx:26',
    ],
  },
  {
    title: 'User Groups',
    description:
      'User groups with access to this workspace. Members and access policies added here apply only in this workspace.',
    actions: [],
    sources: ['Pages/Settings/UserGroups/WorkspaceUserGroupsPage.tsx:32'],
  },
  {
    title: 'Fleet Webhooks',
    description: 'Define custom actions available on the Fleet edit page.',
    actions: ['Webhook'],
    sources: ['Pages/Settings/WorkspaceAgentBuilderWebhooks.tsx:521'],
  },
  {
    title: 'Agent Auth Connections',
    description:
      'Connections agents can use to authenticate with external services.',
    actions: ['Connection'],
    sources: ['Pages/Settings/WorkspaceConnections.tsx:215'],
  },
  {
    title: 'Workspace',
    description: 'Settings that apply to everyone in this workspace.',
    actions: [],
    sources: ['Pages/Settings/WorkspaceGeneral.tsx:37'],
  },
  {
    title: 'GitLab',
    description:
      'Let Engine read GitLab projects, push fixes, and open merge requests.',
    actions: [],
    sources: ['Pages/Settings/WorkspaceGitlab.tsx:55'],
  },
  {
    title: 'Access Control',
    description:
      'Choose which integrations are enabled for agents in this workspace.',
    actions: ['Enable all'],
    sources: ['Pages/Settings/WorkspaceIntegrations.tsx:269'],
  },
  {
    title: 'MCP Servers',
    description: 'Remote MCP servers that can be used within Fleet.',
    actions: ['MCP Server'],
    sources: ['Pages/Settings/WorkspaceMcpServers.tsx:516'],
  },
  {
    title: 'Webhooks',
    actions: [],
    sources: ['Pages/Settings/WorkspaceWebhookSettings.tsx:49'],
  },
  {
    title: 'Webhooks',
    description: 'Send workspace events to external services.',
    actions: ['Webhook'],
    sources: ['Pages/Settings/WorkspaceWebhooks/WorkspaceWebhooks.tsx:301'],
  },
  {
    title: 'Usage',
    actions: [],
    sources: ['Pages/Settings/components/ConfigureUsagePanel.tsx:35'],
  },
  {
    title: 'Usage Burndown vs Commitment',
    description: 'View usage burndown vs commitment for your organization.',
    actions: [],
    sources: ['Pages/Settings/components/ContractUsageDashboard.tsx:64'],
  },
  {
    title: 'Credit Usage',
    description: 'View credit usage for your organization.',
    actions: [],
    sources: ['Pages/Settings/components/ContractUsageDashboard.tsx:64'],
  },
  {
    title: 'Engine',
    description:
      'Engine analyzes your traces to surface issues and improve your applications.',
    actions: [],
    sources: ['Pages/Settings/components/EngineDataPlaneScope.tsx:45'],
  },
  {
    title: 'Granular Billable Usage',
    actions: [],
    sources: ['Pages/Settings/components/GranularUsageDashboard.tsx:131'],
  },
  {
    title: 'Invoices',
    actions: [],
    sources: ['Pages/Settings/components/MetronomeEmbeddedDashboard.tsx:28'],
  },
  {
    title: 'Credit Grants',
    actions: [],
    sources: ['Pages/Settings/components/MetronomeEmbeddedDashboard.tsx:28'],
  },
];

export const headerSources = [
  {
    component: 'AuthLayout',
    source: 'Pages/AgentAuthSecretInput/index.tsx:189',
  },
  {
    component: 'PageTitle',
    source:
      'Pages/AgentBuilder/components/WorkspaceAgents/WorkspaceAgentsPage.tsx:80',
  },
  {
    component: 'AgentOverviewHeader',
    source: 'Pages/AgentOverview/Coding/components/CodingAgentOverview.tsx:472',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/AgentOverview/index.tsx:21',
  },
  {
    component: 'AgentOverviewHeader',
    source: 'Pages/AgentOverview/index.tsx:44',
  },
  {
    component: 'AgentOverviewHeader',
    source: 'Pages/AgentOverview/index.tsx:95',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/AnnotationQueue/index.tsx:11',
  },
  {
    component: 'LayoutBreadcrumbs',
    source:
      'Pages/AnnotationQueueBulkView/AnnotationQueueBulkViewItems.tsx:355',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/AnnotationQueues/index.tsx:86',
  },
  {
    component: 'AuthLayout',
    source: 'Pages/Auth/Auth.tsx:1696',
  },
  {
    component: 'AuthLayout',
    source: 'Pages/Auth/Auth.tsx:1712',
  },
  {
    component: 'AuthLayout',
    source: 'Pages/Auth/Auth.tsx:1800',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/BuildPage/BuildPage.tsx:65',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Context/components/Webhooks/ContextHubWebhooks.tsx:136',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Context/index.tsx:94',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Conversation/Conversation.tsx:545',
  },
  {
    component: 'ConversationHeader',
    source: 'Pages/Conversation/Conversation.tsx:586',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Conversation/ThreadDetailV2.tsx:1112',
  },
  {
    component: 'ConversationHeader',
    source: 'Pages/Conversation/ThreadDetailV2.tsx:1230',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/CustomApps/CustomAppDetail.tsx:100',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/CustomApps/index.tsx:77',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/CustomApps/index.tsx:338',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Dashboards/CustomDashboardsPage.tsx:49',
  },
  {
    component: 'DashboardHeader',
    source: 'Pages/Dashboards/DashboardContent.tsx:441',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Dashboards/DashboardOnboardingPage.tsx:49',
  },
  {
    component: 'DashboardHeader',
    source: 'Pages/Dashboards/DashboardPage.tsx:105',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Dashboards/DashboardPage.tsx:273',
  },
  {
    component: 'DetailPageTitle',
    source: 'Pages/Dashboards/DashboardPage.tsx:294',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Dashboards/DashboardRedirectPage.tsx:305',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Dashboards/DashboardRedirectPage.tsx:326',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Dataset/index.tsx:705',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/Dataset/index.tsx:717',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/DatasetExperiments/index.tsx:736',
  },
  {
    component: 'PageTitle',
    source: 'Pages/DatasetExperiments/index.tsx:754',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Datasets/index.tsx:148',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/EvaluatorDetails/EvaluatorDetailsPage.tsx:172',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/EvaluatorDetails/index.tsx:122',
  },
  {
    component: 'PlaygroundHeader',
    source: 'Pages/EvaluatorPlayground/EvaluatorPlaygroundMain.tsx:444',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/EvaluatorPlayground/EvaluatorPlaygroundPage.tsx:139',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/Evaluators/EvaluatorDetails/EvaluatorDetails.tsx:110',
  },
  {
    component: 'LayoutBreadcrumbs',
    source:
      'Pages/Evaluators/EvaluatorDetails/EvaluatorReusePlayground.tsx:108',
  },
  {
    component: 'PlaygroundHeader',
    source:
      'Pages/Evaluators/EvaluatorDetails/EvaluatorReusePlaygroundMainContent.tsx:215',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Evaluators/index.tsx:74',
  },
  {
    component: 'DetailPageTitle',
    source: 'Pages/Example/index.tsx:219',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Example/index.tsx:371',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/ForgeIssueBoards/components/EngineLayout.tsx:21',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Gateway/GatewayPage.tsx:266',
  },
  {
    component: 'DetailPageTitle',
    source: 'Pages/Gateway/Home/components/GatewaySectionHeader.tsx:6',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Graph/GraphLayoutRoute.tsx:36',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Graph/StudioConnectRoute.tsx:23',
  },
  {
    component: 'LayoutBreadcrumbs',
    source:
      'Pages/Graph/components/StudioAgentBuilder/StudioAgentBuilder.tsx:130',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Home/HomeLayout.tsx:16',
  },
  {
    component: 'WelcomeHeader',
    source: 'Pages/Home/HomeV3/components/HomeHeaderRow.tsx:23',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/HostListeners/HostListeners.tsx:88',
  },
  {
    component: 'AuthLayout',
    source: 'Pages/HostOauthCallback/index.tsx:266',
  },
  {
    component: 'PageTitle',
    source: 'Pages/HostProject/HostProject.tsx:358',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/HostProject/HostProject.tsx:571',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/HostProjects/AgentDeploymentsRoute.tsx:101',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/HostProjects/AgentDeploymentsRoute.tsx:122',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/HostProjects/AllAgentsDeploymentsRoute.tsx:41',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/HostProjects/HostProjects.tsx:189',
  },
  {
    component: 'PageTitle',
    source: 'Pages/HostRevision/HostRevision.tsx:424',
  },
  {
    component: 'PageTitle',
    source: 'Pages/HostRevision/components/RevisionLogsTitleBar.tsx:55',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Hub/HubLayout.tsx:33',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/HubRepo/DraftDirectoryPage.tsx:307',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/HubRepo/index.tsx:306',
  },
  {
    component: 'PageTitle',
    source: 'Pages/HubSearch/index.tsx:18',
  },
  {
    component: 'PageTitle',
    source: 'Pages/HubTenant/index.tsx:12',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/NoMatch/index.tsx:7',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Organization/AgentOrganizationLayout.tsx:385',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Organization/AgentOrganizationLayout.tsx:446',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Overview/Overview.tsx:41',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PairwiseAnnotationQueue/index.tsx:487',
  },
  {
    component: 'PlaygroundHeader',
    source: 'Pages/Playground/PlaygroundHome/PlaygroundMain.tsx:301',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Playground/PlaygroundPage.tsx:120',
  },
  {
    component: 'PageTitle',
    source: 'Pages/Playground/components/PlaygroundHeader.tsx:17',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Playground/index.tsx:35',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Project/Project.tsx:1249',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/Project/Project.tsx:1269',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Project/Project.tsx:2040',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Projects/ProjectsHome.tsx:112',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Projects/ProjectsRoute.tsx:17',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Prompts/index.tsx:98',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PublicDataset/index.tsx:42',
  },
  {
    component: 'PageTitle',
    source: 'Pages/PublicDataset/index.tsx:46',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PublicDatasetRun/index.tsx:23',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PublicDatasetRun/index.tsx:48',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PublicDatasetRunPlayground/index.tsx:24',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PublicExample/index.tsx:12',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PublicRun/index.tsx:107',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/PublicRunPlayground/index.tsx:16',
  },
  {
    component: 'AuthLayout',
    source: 'Pages/ResetPassword/index.tsx:64',
  },
  {
    component: 'RunHeaderNext',
    source:
      'Pages/Run/components/RunDetailsConversationView/RunDetailsConversationView.tsx:362',
  },
  {
    component: 'RunHeaderNext',
    source: 'Pages/Run/components-next/RunDetailsPanelNext.tsx:405',
  },
  {
    component: 'PageTitle',
    source: 'Pages/Run/components-next/RunHeaderNext.tsx:120',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Run/index.tsx:442',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Run/index.tsx:558',
  },
  {
    component: 'PageTitle',
    source: 'Pages/Sandboxes/SandboxBrowserDetail.tsx:249',
  },
  {
    component: 'PageTitle',
    source: 'Pages/Sandboxes/SandboxBrowsers.tsx:34',
  },
  {
    component: 'PageTitle',
    source: 'Pages/Sandboxes/SandboxDetail.tsx:170',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Sandboxes/SandboxLayout.tsx:88',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Sandboxes/SandboxLayout.tsx:136',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/SessionEvaluatorDetails/SessionEvaluatorDetailsPage.tsx:217',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/SessionEvaluatorDetails/index.tsx:160',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/ABAC/ABAC.tsx:43',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/AccountSettings.tsx:54',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/AuditLogs/AuditLogs.tsx:284',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/DeprecatedApiUsage/DeprecatedApiUsage.tsx:176',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/EngineModelProviders/EngineModelProviders.tsx:82',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/EngineModelProviders/EngineModelProviders.tsx:126',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/EnterpriseOrgUsageV2.tsx:186',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/Instance/InstancePage.tsx:272',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/Members/OrgMembersPage.tsx:12',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/Members/components/MembersPageHeader.tsx:24',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/ModelConfigurations/ModelConfigurations.tsx:42',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationAiFeatures.tsx:67',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationApiKeys.tsx:219',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationDataPlanes.tsx:363',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationFeedbackConfigsV2.tsx:422',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationGeneral.tsx:354',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationMembers.tsx:97',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationMembers.tsx:214',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationModelProviders.tsx:190',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationModels.tsx:184',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationOAuthApplications.tsx:415',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationOAuthProviders.tsx:308',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationPlansAndBillingV2.tsx:101',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationResourceTags.tsx:104',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationSSOConfiguration.tsx:668',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationSecrets.tsx:309',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationSharedV2.tsx:384',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationTopicSearch.tsx:86',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationTunedEvaluators.tsx:108',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/OrganizationUsage.tsx:38',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/PlansAndBillingV2/UsageLimitsPage.tsx:53',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/PlansAndBillingV2/UsageLimitsPage.tsx:66',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/PlansAndBillingV2/UsageLimitsPage.tsx:80',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/ScimTokens/ScimTokens.tsx:337',
  },
  {
    component: 'SettingsFrameTitle',
    source: 'Pages/Settings/SettingsGroupedPage.tsx:51',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/ShadowDeployments.tsx:105',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/Tunnels/ConnectionsPage.tsx:149',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/UserGroups/components/UserGroupsPageLayout.tsx:29',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceAgentBuilderWebhooks.tsx:521',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceConnections.tsx:215',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceGeneral.tsx:37',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceGitlab.tsx:55',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceIntegrations.tsx:269',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceMcpServers.tsx:516',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceWebhookSettings.tsx:49',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/WorkspaceWebhooks/WorkspaceWebhooks.tsx:301',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/components/ConfigureUsagePanel.tsx:35',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/components/ContractUsageDashboard.tsx:64',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/components/EngineDataPlaneScope.tsx:45',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/components/GranularUsageDashboard.tsx:131',
  },
  {
    component: 'MembersPageHeader',
    source: 'Pages/Settings/components/MembersTable.tsx:721',
  },
  {
    component: 'SettingsPageHeader',
    source: 'Pages/Settings/components/MetronomeEmbeddedDashboard.tsx:28',
  },
  {
    component: 'SettingsFrameTitle',
    source: 'Pages/Settings/components/SettingsPage.tsx:184',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Simulations/SimulationPage.tsx:130',
  },
  {
    component: 'ResourceDetailLayout',
    source: 'Pages/Simulations/SimulationPage.tsx:166',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Simulations/SimulationsPage.tsx:66',
  },
  {
    component: 'LayoutBreadcrumbs',
    source: 'Pages/Tools/ToolsPage.tsx:415',
  },
];
