import React, { Component, PropTypes, Children } from 'react'
import { render } from 'react-dom'
import { dissocPath } from 'lodash/fp'

export default class ShadowReact extends Component {

  static propTypes = {
    boundaryMode: PropTypes.oneOf(['open', 'closed']),
    children: PropTypes.node.isRequired,
    includes: PropTypes.array,
    htmlString: PropTypes.string,
    htmlStringWrapperTag: PropTypes.string,
    wrapperTag: PropTypes.string,
  }

  static defaultProps = {
    includes: [],
    wrapperTag: 'div',
    htmlStringWrapperTag: 'div',
    boundaryMode: 'open'
  }

  state = { fetching: false }

  includesContainer = document.createElement('div')
  includesContainerAttached = false

  attachShadow() {
    const host = this.refs.host
    const root = host.shadowRoot || host.attachShadow({ mode: this.props.boundaryMode })
    const el = (
      <this.props.wrapperTag>
        {this.props.htmlString && <this.props.htmlStringWrapperTag dangerouslySetInnerHTML={{ __html: this.props.htmlString }} />}
        {this.props.children.props.children}
      </this.props.wrapperTag>
    )

    render(el, root)

    return root
  }

  async attachIncludes(root) {
    if (!this.includesContainerAttached) {
      root.appendChild(this.includesContainer)
      this.includesContainerAttached = true
    } else {
      this.includesContainer.innerHTML = ''
    }

    const { includes } = this.props
    if (!includes.length) return
    this.setState({ fetching: true })

    const fragment = document.createDocumentFragment()

    const elements = await Promise.all(includes.map(async url => {
      const ext = url.split('.').pop()
      const infos = {
        ext,
        tag: ext === 'js' ? 'script' : 'style'
      }

      try {
        const resp = await fetch(url)
        const text = await resp.text()

        const element = document.createElement(infos.tag)
        element.innerHTML = text
        return element
      } catch (err) {
        console.log(err)
      }
    }))

    elements.forEach(element => {
      if (element)
        fragment.appendChild(element)
    })

    this.includesContainer.appendChild(fragment)
    this.setState({ fetching: false })
  }

  componentDidMount() {
    const root = this.attachShadow()
    this.attachIncludes(root)
  }

  render() {
    const directChild = Children.only(this.props.children)
    if (typeof directChild.type !== 'string')
      throw new Error('ShadowReact: Passed direct child must be a concrete HTML element rather than another React component')

    const host = dissocPath(['props', 'children'])(directChild)
    return <host.type ref='host' {...host.props} className={`${host.props.className ? host.props.className : ''} ${this.state.fetching ? '@ShadowReact_fetching' : '@ShadowReact_fetched'}`.trim()} />
  }

  update() {
    return new Promise(async resolve => {
      const root = this.attachShadow()
      await this.attachIncludes(root)
      resolve()
    })
  }
}
