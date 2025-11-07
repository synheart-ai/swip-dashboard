/**
 * Tabs Component
 *
 * Tabbed interface for switching between views
 */

'use client';

import { ReactNode, useState } from 'react';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content?: ReactNode;
}

export interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  children?: (activeTab: string) => ReactNode;
}

export function Tabs({ tabs, defaultTab, onChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className="w-full">
      {/* Tab Headers */}
      <div className="flex gap-2 border-b border-gray-800 mb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-3
                font-medium transition-all duration-200
                border-b-2 -mb-[1px]
                ${
                  isActive
                    ? 'border-synheart-pink text-synheart-pink'
                    : 'border-transparent text-gray-400 hover:text-white'
                }
              `}
            >
              {tab.icon && <span>{tab.icon}</span>}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {children ? children(activeTab) : activeTabContent}
      </div>
    </div>
  );
}
