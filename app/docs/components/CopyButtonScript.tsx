'use client';

import { useEffect } from 'react';

export function CopyButtonScript() {
  useEffect(() => {
    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('.docs-content pre');
      
      codeBlocks.forEach((block) => {
        if (block.querySelector('.copy-button')) return;
        
        const button = document.createElement('button');
        button.className = 'copy-button';
        button.setAttribute('title', 'Copy code');
        button.innerHTML = `
          <svg class="copy-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
          </svg>
          <svg class="check-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display:none">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        `;
        
        button.addEventListener('click', async () => {
          const code = block.querySelector('code')?.textContent || '';
          await navigator.clipboard.writeText(code);
          
          const copyIcon = button.querySelector('.copy-icon') as HTMLElement;
          const checkIcon = button.querySelector('.check-icon') as HTMLElement;
          
          if (copyIcon && checkIcon) {
            copyIcon.style.display = 'none';
            checkIcon.style.display = 'block';
            button.style.color = '#22c55e';
            
            setTimeout(() => {
              copyIcon.style.display = 'block';
              checkIcon.style.display = 'none';
              button.style.color = '';
            }, 2000);
          }
        });
        
        (block as HTMLElement).style.position = 'relative';
        (block as HTMLElement).appendChild(button);
      });
    };

    // Run after a small delay to ensure content is rendered
    const timeout = setTimeout(addCopyButtons, 100);
    
    return () => clearTimeout(timeout);
  }, []);

  return null;
}

