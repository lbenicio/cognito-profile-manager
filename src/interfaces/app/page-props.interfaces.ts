export interface PageProps {
  params: {
    locale: string;
  };
}

export interface AccountPageProps extends PageProps {}
export interface ContactPageProps extends PageProps {}
export interface DashboardPageProps extends PageProps {}
export interface PrivacyPolicyPageProps extends PageProps {}
export interface ProfilePageProps extends PageProps {}
export interface SecurityPageProps extends PageProps {}
export interface SettingsPageProps extends PageProps {}
export interface TermsOfServicePageProps extends PageProps {}
export interface LoginPageProps extends PageProps {}

export interface MainAppLayoutProps {
  children: React.ReactNode;
}
