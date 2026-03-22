import { useTranslation } from 'react-i18next';

export type TabId = 'dashboard' | 'blog' | 'products' | 'about';

type TabNavProps = {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  hasWooCommerce: boolean;
};

const TABS: { id: TabId; label: string; requiresWoo?: boolean }[] = [
  { id: 'dashboard', label: 'tabs.dashboard' },
  { id: 'blog', label: 'tabs.blogGenerator' },
  { id: 'products', label: 'tabs.products' },
  { id: 'about', label: 'tabs.about' },
];

export function TabNav({ activeTab, onTabChange, hasWooCommerce }: TabNavProps) {
  const { t } = useTranslation();

  return (
    <div className="xc-tabs">
      {TABS.map((tab) => {
        const disabled = tab.requiresWoo === true && !hasWooCommerce;
        const active = activeTab === tab.id;
        let className = 'xc-tabs__tab';
        if (active) className += ' xc-tabs__tab--active';
        if (disabled) className += ' xc-tabs__tab--disabled';

        return (
          <button
            key={tab.id}
            type="button"
            className={className}
            onClick={() => !disabled && onTabChange(tab.id)}
            disabled={disabled}
          >
            {t(tab.label)}
          </button>
        );
      })}
    </div>
  );
}
