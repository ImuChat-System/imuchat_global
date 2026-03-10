/**
 * Widget Content Registry — Mappe chaque WidgetType à son composant de contenu
 *
 * Utilisé par WidgetGrid via renderContent pour injecter le bon rendu
 * selon le type de widget et ses données.
 *
 * Sprint S7 Axe A — Widgets Core
 */

import type { HomeWidget, WidgetType } from "@/types/home-hub";
import React from "react";
import AgendaWidgetContent from "./AgendaWidgetContent";
import AITipsWidgetContent from "./AITipsWidgetContent";
import ArenaWidgetContent from "./ArenaWidgetContent";
import FriendsOnlineWidgetContent from "./FriendsOnlineWidgetContent";
import GamingWidgetContent from "./GamingWidgetContent";
import MusicWidgetContent from "./MusicWidgetContent";
import RecapWidgetContent from "./RecapWidgetContent";
import ScreenTimeWidgetContent from "./ScreenTimeWidgetContent";
import TasksWidgetContent from "./TasksWidgetContent";
import WalletWidgetContent from "./WalletWidgetContent";
import WeatherWidgetContent from "./WeatherWidgetContent";

// ─── Registry ─────────────────────────────────────────────────

type WidgetContentComponent = React.FC<{ data: Record<string, unknown> }>;

const WIDGET_CONTENT_MAP: Partial<Record<WidgetType, WidgetContentComponent>> =
  {
    wallet: WalletWidgetContent,
    music: MusicWidgetContent,
    friends_online: FriendsOnlineWidgetContent,
    recap: RecapWidgetContent,
    screen_time: ScreenTimeWidgetContent,
    ai_tips: AITipsWidgetContent,
    agenda: AgendaWidgetContent,
    arena: ArenaWidgetContent,
    gaming: GamingWidgetContent,
    weather: WeatherWidgetContent,
    tasks: TasksWidgetContent,
  };

/**
 * Rendu du contenu d'un widget à partir de ses données.
 * Retourne null si aucun renderer n'est enregistré pour ce type.
 */
export function renderWidgetContent(widget: HomeWidget): React.ReactNode {
  const Component = WIDGET_CONTENT_MAP[widget.type];
  if (!Component) return null;
  return <Component data={widget.data ?? {}} />;
}

export {
  AgendaWidgetContent,
  AITipsWidgetContent,
  ArenaWidgetContent,
  FriendsOnlineWidgetContent,
  GamingWidgetContent,
  MusicWidgetContent,
  RecapWidgetContent,
  ScreenTimeWidgetContent,
  TasksWidgetContent,
  WalletWidgetContent,
  WeatherWidgetContent,
  WIDGET_CONTENT_MAP
};
