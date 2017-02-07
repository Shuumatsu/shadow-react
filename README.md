Shadow DOM in React

### Props 
```
static propTypes = {
  children: PropTypes.node.isRequired,
  includes: PropTypes.array,
  wrapperTag: PropTypes.string,
  boundaryMode: PropTypes.oneOf(['open', 'closed'])
  htmlString: PropTypes.string
}

static defaultProps = {
  includes: [],
  wrapperTag: 'div',
  boundaryMode: 'open'
}
```

1. the direct child of this React Component must be a html tag rather than a React Component, because the direct child will be the the host element of the shadow dom
2. htmlString provided will be added into the shadow dom right before the direct child's children
3. includes will be added after the direct child's children in order

### Flash of unstyled content
Since documents specified in the `includes` prop are fetched over the network, so a hook is provided, 
the host element has a className of `@ShadowReact_fetching` when fetching, `@ShadowReact_fetched` after **all** the documents are fetched or failed (`Promise.all`)

### Demo
run `yarn start`

Demo's almost the same with the init page provided by `create-react-app`, but using shadow dom instead.