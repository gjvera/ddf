const React = require('react')

const { Units } = require('./common')
const TextField = require('../text-field')
import styled from '../styles/styled-components'

const Invalid = styled.div`
  background-color: ${props => props.theme.negativeColor};
  height: 100%;
  display: block;
  overflow: hidden;
  color: white;
`

class BaseLine extends React.Component {
  isValid = true
  inValidMessage = ''
  constructor(props) {
    super(props)
    const { geometryKey } = props
    const value = JSON.stringify(props[geometryKey])
    this.state = { value }
    this.is2DArray = this.is2DArray.bind(this)
    this.isValidListOfPoints = this.isValidListOfPoints.bind(this)
    this.isValidPolygon = this.isValidPolygon.bind(this)
    this.isValidInput = this.isValidInput.bind(this)
  }
  componentWillReceiveProps(props) {
    if (document.activeElement !== this.ref) {
      const { geometryKey } = props
      const value = JSON.stringify(props[geometryKey])
      this.setState({ value })
    }
  }
  render() {
    const props = this.props
    const { label, cursor, geometryKey, unitKey, widthKey } = props
    return (
      <React.Fragment>
        <div className="input-location">
          <TextField
            label={label}
            value={this.state.value}
            onChange={value => {
              this.setState({ value })
              const fn = cursor(geometryKey)
              try {
                fn(JSON.parse(value))
              } catch (e) {}
            }}
            onBlur={() => this.isValidInput(this.state.value)}
            onFocus={value => {
              this.isValid = true
              this.setState()
            }}
          />
          <Units value={props[unitKey]} onChange={cursor(unitKey)}>
            <TextField
              type="number"
              label="Buffer width"
              min={0.000001}
              value={props[widthKey]}
              onChange={cursor(widthKey)}
            />
          </Units>
        </div>
        {this.isValid ? (
          ''
        ) : (
          <Invalid>
            &nbsp;
            <span className="fa fa-exclamation-triangle" />
            &nbsp; {this.inValidMessage}
          </Invalid>
        )}
      </React.Fragment>
    )
  }
  isValidInput(value) {
    this.inValidMessage = ''
    this.inValidPoint = ''
    if (this.isValidPolygon(value)) {
      this.isValid = true
      this.setState({ value })
    } else {
      this.isValid = false
      this.setState({ value })
    }
  }
  is2DArray(coordinates) {
    try {
      let parsedCoords = JSON.parse(coordinates)
      return Array.isArray(parsedCoords) && Array.isArray(parsedCoords)
    } catch (e) {
      return false
    }
  }
  isValidListOfPoints(coordinates) {
    let message = ''
    if (this.props.mode === 'poly' && coordinates.length < 4) {
      message = 'Minimum of 4 points needed for polygon'
    } else if (this.props.mode === 'line' && coordinates.length < 2) {
      message = 'Minimum of 2 points needed for line'
    }
    coordinates.forEach(point => {
      if (
        point.length !== 2 ||
        (Number.isNaN(Number.parseFloat(point[0])) &&
          Number.isNaN(Number.parseFloat(point[1])))
      ) {
        message = JSON.stringify(point) + ' is not a valid point.'
      } else {
        if (
          point[0] > 180 ||
          point[0] < -180 ||
          point[1] > 90 ||
          point[1] < -90
        ) {
          message = JSON.stringify(point) + ' is not a valid point.'
        }
      }
    })
    if (message !== '') {
      this.inValidMessage = message
      return false
    }
    return true
  }
  isValidPolygon(coordinates) {
    if (!this.is2DArray(coordinates)) {
      this.inValidMessage = 'Not an acceptable value.'
      return false
    } else if (!this.isValidListOfPoints(JSON.parse(coordinates))) {
      return false
    }
    return true
  }
}

module.exports = BaseLine
