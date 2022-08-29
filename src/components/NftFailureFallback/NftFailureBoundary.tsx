import { Component, PropsWithChildren, ReactNode } from 'react';

type State = {
  error: Error | null;
};

type Props = PropsWithChildren<{
  fallback: ReactNode;
  onError: (error: Error) => void;
}>;

export class NftFailureBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      error: null,
    };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
