import React, { Component, Children } from 'react'
import { render } from 'react-dom'
import PropTypes from 'prop-types'
import { dissocPath } from 'lodash/fp'

export default class extends Component {
  static propTypes = {
    boundaryMode: PropTypes.oneOf(['open', 'closed']),
    children: PropTypes.node.isRequired,
    includes: PropTypes.array,
    htmlString: PropTypes.string,
    htmlStringWrapperTag: PropTypes.string,
    wrapperTag: PropTypes.string,
    attachedCallback: PropTypes.func
  }

  static defaultProps = {
    includes: [],
    wrapperTag: 'div',
    htmlStringWrapperTag: 'div',
    boundaryMode: 'open'
  }

  attachShadow() {
    const host = this.host
    const root = host.shadowRoot || host.attachShadow({ mode: this.props.boundaryMode })
    const el = (
      <this.props.wrapperTag>
        {this.props.htmlString && <this.props.htmlStringWrapperTag dangerouslySetInnerHTML={{ __html: this.props.htmlString }} />}
        {this.props.children.props.children}
      </this.props.wrapperTag>
    )

    render(el, root)

    this.shadowRoot = root
    return root
  }

  includesContainer = document.createElement('div')
  includesContainerAttached = false
  async attachIncludes(root) {
    if (this.includesContainerAttached) {
      this.includesContainer.innerHTML = ''
    } else {
      root.appendChild(this.includesContainer)
      this.includesContainerAttached = true
    }

    const { includes } = this.props
    if (!includes.length)
      return

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
  }

  componentDidMount() {
    this.update()
  }

  componentDidUpdate() {
    this.update()
  }

  update = async () => {
    const root = this.attachShadow()
    await this.attachIncludes(root)
    const { attachedCallback } = this.props
    attachedCallback && attachedCallback(this)
  }

  render() {
    const directChild = Children.only(this.props.children)
    if (typeof directChild.type !== 'string')
      throw new Error('ShadowReact: Passed direct child must be a concrete HTML element rather than another React component')

    const host = dissocPath(['props', 'children'])(directChild)
    return <host.type ref={host => this.host = host} {...directChild.props} />
  }
}