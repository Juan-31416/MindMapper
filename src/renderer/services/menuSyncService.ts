import type { TFunction } from 'i18next';
import type { MenuLabels } from '../../shared/types/menu';
import i18n from '../i18n/i18n';

export function buildMenuLabels(t: TFunction<'translation', unknown>): MenuLabels {
  return {
    file: t('menu.file'),
    newMap: t('menu.newMap'),
    open: t('menu.open'),
    save: t('menu.save'),
    saveAs: t('menu.saveAs'),
    export: t('menu.export'),
    exportPDF: t('menu.exportPDF'),
    exportJSON: t('menu.exportJSON'),
    exit: t('menu.exit'),
    edit: t('menu.edit'),
    undo: t('menu.undo'),
    redo: t('menu.redo'),
    view: t('menu.view'),
    zoomIn: t('menu.zoomIn'),
    zoomOut: t('menu.zoomOut'),
    resetZoom: t('menu.resetZoom'),
    fitToScreen: t('menu.fitToScreen'),
    toggleTheme: t('menu.toggleTheme'),
    help: t('menu.help'),
    documentation: t('menu.documentation'),
    shortcuts: t('menu.shortcuts'),
    about: t('menu.about'),
    aboutDetail: t('menu.aboutDetail'),
    ok: t('common.ok'),
  };
}

export function syncNativeMenuLabels(): void {
  if (typeof window === 'undefined' || !window.electronAPI?.menu?.setLabels) {
    return;
  }

  const labels = buildMenuLabels(i18n.t);
  window.electronAPI.menu.setLabels(labels);
}