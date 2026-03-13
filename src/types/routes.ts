import { ReactNode } from "react";

export interface RouteItem {
  path: string;
  element: ReactNode;
}

export interface CandidateRoutes {
  agreed: RouteItem[];
  submitted: RouteItem[];
}

export interface RoutesConfig {
  public: RouteItem[];
  admin: RouteItem[];
  candidate: CandidateRoutes;
}