import { Component, PropsWithChildren } from 'react';
import { NftFailureFallback } from 'components/NftFailureFallback/NftFailureFallback';

type State = {
  error: Error | null;
};

type Props = PropsWithChildren<{
  refreshing: boolean;
  onRetry: () => void;
  onError: () => void;
}>;

export class NftFailureBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      error: null,
    };
  }

  componentDidCatch(error: Error) {
    this.props.onError();
    this.setState({ error });
  }

  render() {
    if (this.state.error) {
      return <NftFailureFallback onClick={this.props.onRetry} refreshing={this.props.refreshing} />;
    }

    return this.props.children;
  }
}
