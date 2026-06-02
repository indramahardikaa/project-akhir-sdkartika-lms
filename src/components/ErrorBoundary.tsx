'use client';

import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: false }; // Don't show fallback for extension errors
  }

  componentDidCatch(error: Error) {
    // Ignore Chrome extension errors
    if (error.message?.includes('Could not establish connection') ||
        error.message?.includes('Receiving end does not exist') ||
        error.stack?.includes('chrome-extension://')) {
      // These are browser extension errors, not our app errors
      this.setState({ hasError: false });
      return;
    }
    console.error('App Error:', error);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;
