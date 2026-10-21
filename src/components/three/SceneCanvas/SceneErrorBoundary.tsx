'use client'

import { Component, type ErrorInfo, type ReactNode } from 'react'

interface Props {
  onError: (error: Error) => void
  children: ReactNode
}

export default class SceneErrorBoundary extends Component<
  Props,
  { failed: boolean }
> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch(error: Error, _info: ErrorInfo) {
    this.props.onError(error)
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}
