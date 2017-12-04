exports.decorateTerm = (Term, { React }) => {
  const Selector = require('emjr').default
  class HyperEmoji extends React.Component {
    constructor(props, context) {
      super(props, context)
      this.state = { open: false }
      this.handleToggle = this.handleToggle.bind(this)
    }

    handleToggle() {
      this.setState(({ open }) => ({ open: !open }))
    }

    componentDidMount() {
      window.rpc.on('hyper-emoji:toggle', this.handleToggle)
    }

    componentWillUnmount() {
      window.rpc.removeListener('hyper-emoji:toggle', this.handleToggle)
    }

    render() {
      const style = Object.assign({}, this.props.style || {}, {
        height: '100%',
      })
      return React.createElement(
        'div',
        {
          style,
        },
        this.state.open &&
          React.createElement(
            'div',
            {
              style: {
                display: this.state.open ? 'block' : 'none',
                position: 'fixed',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 10,
              },
            },
            React.createElement(
              Selector,
              {
                autoFocus: true,
                set: 'apple',
                native: false, // maybe?
                onClick: emoji => {
                  this.setState({ open: false })
                  const data = emoji.char + ' ' // TODO: add option for this
                  const escaped = false
                  const uid = null
                  window.store.dispatch((dispatch, getState) => {
                    dispatch({
                      type: 'SESSION_USER_DATA',
                      data,
                      effect() {
                        // If no uid is passed, data is sent to the active session.
                        const targetUid = uid || getState().sessions.activeUid
                        dispatch({ type: 'SET_ACTIVE', uid: targetUid })
                        document.querySelector('textarea').focus()
                        window.rpc.emit('data', {
                          uid: targetUid,
                          data,
                          escaped: false,
                        })
                      },
                    })
                  })
                },
              },
              'hello',
            ),
          ),
        React.createElement(Term, this.props),
      )
    }
  }
  return HyperEmoji
}

const toggleEmojiPicker = focusedWindow => {
  if (focusedWindow !== null) {
    focusedWindow.rpc.emit('hyper-emoji:toggle', { focusedWindow })
  }
}

exports.decorateMenu = menu => {
  return menu.map(menuItem => {
    if (menuItem.label !== 'View') {
      return menuItem
    }

    const newMenuItem = Object.assign({}, menuItem)
    newMenuItem.submenu = [...newMenuItem.submenu]

    newMenuItem.submenu.push({
      type: 'separator',
    })

    newMenuItem.submenu.push({
      label: 'Toggle emoji picker',

      accelerator: 'ctrl+option+space',

      click: (item, focusedWindow) => {
        toggleEmojiPicker(focusedWindow)
      },
    })

    return newMenuItem
  })
}
