/**
 * MAKKN Chat Widget - Embeddable Component
 * Version: 1.0.0
 * 
 * This is a standalone web component that can be embedded on any website.
 * It fetches configuration from the MAKKN API and renders a customizable chat widget.
 */

(function () {
  'use strict';

  // Define the custom element
  class ChatWidget extends HTMLElement {
    constructor() {
      super();
      this.attachShadow({ mode: 'open' });
      this.isOpen = false;
      this.config = null;
    }

    connectedCallback() {
      // Get attributes
      const projectId = this.getAttribute('project-id');
      const apiUrl = this.getAttribute('api-url') || 'https://makkn.com';
      const position = this.getAttribute('position') || 'right';
      const primaryColor = this.getAttribute('primary-color') || '#6320CE';

      // Fetch configuration
      this.fetchConfig(apiUrl, projectId, position, primaryColor);
    }

    async fetchConfig(apiUrl, projectId, position, primaryColor) {
      console.log('🔧 Widget: Fetching config from:', `${apiUrl}/api/widget/${projectId}`);
      console.log('🔧 Widget: Fallback values - position:', position, 'primaryColor:', primaryColor);

      try {
        const response = await fetch(`${apiUrl}/api/widget/${projectId}`);
        console.log('🔧 Widget: API response status:', response.status);

        if (response.ok) {
          this.config = await response.json();
          console.log('✅ Widget: Config loaded from API:', this.config);
        } else {
          console.warn('⚠️ Widget: API failed, using fallback config');
          // Fallback to attributes if API fails
          this.config = {
            position: position,
            colors: {
              primary: primaryColor,
              header: primaryColor,
              background: '#ffffff',
              foreground: '#000000',
              input: '#e5e7eb'
            },
            branding: {
              chatIcon: null,
              agentIcon: null,
              userIcon: null,
              showChatIcon: true,
              showAgentAvatar: true,
              showUserAvatar: true
            },
            text: {
              headerTitle: 'Chat Widget',
              welcomeMessage: 'Hi! How can I help you?',
              placeholder: 'Message...'
            }
          };
        }
      } catch (error) {
        console.error('❌ Widget: Failed to fetch widget config:', error);
        // Use fallback config
        this.config = {
          position: position,
          colors: {
            primary: primaryColor,
            header: primaryColor,
            background: '#ffffff',
            foreground: '#000000',
            input: '#e5e7eb'
          },
          branding: {
            chatIcon: null,
            agentIcon: null,
            userIcon: null,
            showChatIcon: true,
            showAgentAvatar: true,
            showUserAvatar: true
          },
          text: {
            headerTitle: 'Chat Widget',
            welcomeMessage: 'Hi! How can I help you?',
            placeholder: 'Message...'
          }
        };
      }

      console.log('🎨 Widget: Final config being used:', this.config);
      this.render();
    }

    render() {
      if (!this.config) return;

      const { position, colors, branding, text } = this.config;
      const positionClass = position === 'left' ? 'left-6' : 'right-6';
      const alignClass = position === 'left' ? 'items-start' : 'items-end';

      this.shadowRoot.innerHTML = `
        <style>
          ${this.getStyles()}
        </style>
        
        <div class="widget-container ${positionClass} ${alignClass}">
          ${this.isOpen ? this.getChatWindow() : ''}
          ${this.getToggleButton()}
        </div>
      `;

      this.attachEventListeners();
    }

    getStyles() {
      const { colors } = this.config;

      return `
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        .widget-container {
          position: fixed;
          bottom: 1.5rem;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .left-6 { left: 1.5rem; }
        .right-6 { right: 1.5rem; }
        .items-start { align-items: flex-start; }
        .items-end { align-items: flex-end; }

        .chat-window {
          width: 350px;
          height: 500px;
          background: ${colors.background};
          color: ${colors.foreground};
          border-radius: 1rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .chat-header {
          background: ${colors.header};
          padding: 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-header-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .avatar-icon {
          width: 1.5rem;
          height: 1.5rem;
          color: white;
        }

        .header-text h3 {
          font-size: 1rem;
          font-weight: 600;
          color: white;
        }

        .header-text p {
          font-size: 0.75rem;
          color: rgba(255, 255, 255, 0.8);
        }

        .close-btn {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.8);
          cursor: pointer;
          padding: 0.25rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }

        .close-btn:hover {
          color: white;
        }

        .messages {
          flex: 1;
          padding: 1rem;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .message {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
        }

        .message.user {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }

        .message-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .message-avatar-icon {
          width: 1.25rem;
          height: 1.25rem;
          color: #6b7280;
        }

        .message-content {
          background: #f3f4f6;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          max-width: 80%;
          font-size: 0.875rem;
          line-height: 1.5;
        }

        .message.agent .message-content {
          border-top-left-radius: 0.25rem;
        }

        .message.user .message-content {
          background: ${colors.primary};
          color: white;
          border-top-right-radius: 0.25rem;
        }

        .input-area {
          padding: 1rem;
          border-top: 1px solid #e5e7eb;
        }

        .input-wrapper {
          position: relative;
        }

        .input-field {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          background: #f9fafb;
          border: 1px solid ${colors.input};
          border-radius: 9999px;
          font-size: 0.875rem;
          outline: none;
          font-family: inherit;
        }

        .input-field:focus {
          ring: 2px;
          ring-color: ${colors.primary};
          ring-opacity: 0.5;
        }

        .send-btn {
          position: absolute;
          right: 0.5rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: ${colors.primary};
          cursor: pointer;
          padding: 0.375rem;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background-color 0.2s;
        }

        .send-btn:hover {
          background: #e5e7eb;
        }

        .send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .branding {
          margin-top: 0.5rem;
          text-align: center;
          font-size: 0.625rem;
          color: #9ca3af;
        }

        .typing-dot {
          display: inline-block;
          animation: typing 1.4s infinite ease-in-out both;
          margin: 0 1px;
          font-weight: bold;
          font-size: 1.2rem;
          line-height: 0.5;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        .toggle-btn {
          width: 3.5rem;
          height: 3.5rem;
          border-radius: 50%;
          background: ${colors.primary};
          border: none;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .toggle-btn:hover {
          transform: scale(1.1);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .toggle-btn:active {
          transform: scale(0.95);
        }

        .toggle-icon {
          width: 2rem;
          height: 2rem;
          color: white;
        }

        .toggle-icon img {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        @media (max-width: 640px) {
          .chat-window {
            width: 340px;
            height: 480px;
          }

          .widget-container {
            bottom: 1rem;
          }

          .left-6 { left: 1rem; }
          .right-6 { right: 1rem; }

          .toggle-btn {
            width: 3rem;
            height: 3rem;
          }

          .toggle-icon {
            width: 1.5rem;
            height: 1.5rem;
          }
        }
      `;
    }

    getChatWindow() {
      const { colors, branding, text } = this.config;

      return `
        <div class="chat-window">
          <div class="chat-header">
            <div class="chat-header-content">
              ${branding.showAgentAvatar ? `
                <div class="avatar">
                  ${branding.agentIcon
            ? `<img src="${branding.agentIcon}" alt="Agent" />`
            : `<svg class="avatar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>`
          }
                </div>
              ` : ''}
              <div class="header-text">
                <h3>${text.headerTitle}</h3>
                <p>Online</p>
              </div>
            </div>
            <button class="close-btn" id="close-btn">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="messages" id="chat-messages">
            <div class="message agent">
              ${branding.showAgentAvatar ? `
                <div class="message-avatar">
                  ${branding.agentIcon
            ? `<img src="${branding.agentIcon}" alt="Agent" />`
            : `<svg class="message-avatar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>`
          }
                </div>
              ` : ''}
              <div class="message-content">${text.welcomeMessage}</div>
            </div>
          </div>

          <div class="input-area">
            <div class="input-wrapper">
              <input 
                type="text" 
                class="input-field" 
                placeholder="${text.placeholder}"
                id="message-input"
              />
              <button class="send-btn" id="send-btn">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <div class="branding">Powered by MAKKN</div>
          </div>
        </div>
      `;
    }

    getToggleButton() {
      const { branding } = this.config;

      return `
        <button class="toggle-btn" id="toggle-btn">
          <div class="toggle-icon">
            ${branding.showChatIcon && branding.chatIcon
          ? `<img src="${branding.chatIcon}" alt="Chat" />`
          : `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>`
        }
          </div>
        </button>
      `;
    }

    attachEventListeners() {
      const toggleBtn = this.shadowRoot.getElementById('toggle-btn');
      const closeBtn = this.shadowRoot.getElementById('close-btn');
      const sendBtn = this.shadowRoot.getElementById('send-btn');
      const inputField = this.shadowRoot.getElementById('message-input');

      if (toggleBtn) {
        toggleBtn.addEventListener('click', () => {
          this.isOpen = !this.isOpen;
          this.render();
        });
      }

      if (closeBtn) {
        closeBtn.addEventListener('click', () => {
          this.isOpen = false;
          this.render();
        });
      }

      if (sendBtn && inputField) {
        const handleSend = () => {
          const message = inputField.value.trim();
          if (message) {
            this.sendMessage(message);
            inputField.value = '';
          }
        };

        sendBtn.addEventListener('click', handleSend);
        inputField.addEventListener('keypress', (e) => {
          if (e.key === 'Enter') {
            handleSend();
          }
        });
      }
    }

    async sendMessage(message) {
      const messagesContainer = this.shadowRoot.getElementById('chat-messages');
      const apiUrl = this.getAttribute('api-url') || 'https://makkn.com';
      const projectId = this.getAttribute('project-id');
      const { branding } = this.config;

      // Add user message
      const userMsgDiv = document.createElement('div');
      userMsgDiv.className = 'message user';
      userMsgDiv.innerHTML = `
                ${branding.showUserAvatar ? `
                    <div class="message-avatar">
                        ${branding.userIcon
            ? `<img src="${branding.userIcon}" alt="User" />`
            : `<svg class="message-avatar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>`
          }
                    </div>
                ` : ''}
                <div class="message-content">${message}</div>
            `;
      messagesContainer.appendChild(userMsgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      // Add loading state
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'message agent loading';
      loadingDiv.innerHTML = `
                ${branding.showAgentAvatar ? `
                    <div class="message-avatar">
                        ${branding.agentIcon
            ? `<img src="${branding.agentIcon}" alt="Agent" />`
            : `<svg class="message-avatar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>`
          }
                    </div>
                ` : ''}
                <div class="message-content">
                    <span class="typing-dot">.</span><span class="typing-dot">.</span><span class="typing-dot">.</span>
                </div>
            `;
      messagesContainer.appendChild(loadingDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      try {
        const response = await fetch(`${apiUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: message,
            project_id: projectId
          })
        });

        // Remove loading
        messagesContainer.removeChild(loadingDiv);

        if (response.ok) {
          const data = await response.json();
          const botMsgDiv = document.createElement('div');
          botMsgDiv.className = 'message agent';
          botMsgDiv.innerHTML = `
                        ${branding.showAgentAvatar ? `
                            <div class="message-avatar">
                                ${branding.agentIcon
                ? `<img src="${branding.agentIcon}" alt="Agent" />`
                : `<svg class="message-avatar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>`
              }
                            </div>
                        ` : ''}
                        <div class="message-content">${data.response}</div>
                    `;
          messagesContainer.appendChild(botMsgDiv);
        } else {
          throw new Error('Failed to get response');
        }
      } catch (error) {
        console.error('Chat error:', error);
        if (loadingDiv.parentNode) {
          messagesContainer.removeChild(loadingDiv);
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'message agent error';
        errorDiv.innerHTML = `
                    ${branding.showAgentAvatar ? `
                        <div class="message-avatar">
                            ${branding.agentIcon
              ? `<img src="${branding.agentIcon}" alt="Agent" />`
              : `<svg class="message-avatar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>`
            }
                        </div>
                    ` : ''}
                    <div class="message-content" style="background: #fee2e2; color: #991b1b;">
                        Sorry, I encountered an error. Please try again.
                    </div>
                `;
        messagesContainer.appendChild(errorDiv);
      }

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }

  // Register the custom element
  if (!customElements.get('your-chat-widget')) {
    customElements.define('your-chat-widget', ChatWidget);
  }
})();
