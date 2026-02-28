export function changeTimeFormatEST(inputDate: string) {
  if (!inputDate) return ''

  let input = inputDate
  let resultStr = ''

  const date = new Date(input + ' GMT')

  // Get the year, month, day, hours, minutes, and seconds as strings
  const year = date.getFullYear().toString()
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  const day = date.getDate().toString().padStart(2, '0')
  const hours = date.getHours().toString().padStart(2, '0')
  const minutes = date.getMinutes().toString().padStart(2, '0')
  const seconds = date.getSeconds().toString().padStart(2, '0')

  // Concatenate the date and time strings with hyphens and colons in between
  const localTime = year + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds

  input = localTime

  if (inputDate.split('-').length != 2) {
    // let date = new Date(input);
    // let options = { year: "numeric", month: "long", day: "numeric", hour: "numeric", minute: "numeric" };
    // let output = date.toLocaleString("en-US", options);
    // output = output.replace("AM", "am").replace("PM", "pm").replace("00", "12");
    // console.log(output);

    // let date = new Date(input);
    // let months = [
    //   'Jan',
    //   'Feb',
    //   'Mar',
    //   'Apr',
    //   'May',
    //   'Jun',
    //   'Jul',
    //   'Aug',
    //   'Sep',
    //   'Oct',
    //   'Nov',
    //   'Dec'
    // ]
    // let fullMonthName = [
    //   'January',
    //   'February',
    //   'March',
    //   'April',
    //   'May',
    //   'June',
    //   'July',
    //   'August',
    //   'September',
    //   'October',
    //   'November',
    //   'December'
    // ]
    // let output = months[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear() + " " + (date.getHours() % 12 || 12) + ":" + date.getMinutes() + (date.getHours() >= 12 ? " PM" : " AM");
    // return output;

    input = input.replace(' ', 'T') + 'Z'
    const givenDate = new Date(input)
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      timeZone: 'UTC'
    }
    const formattedDate = givenDate.toLocaleString('en-US', options as any)
    // var formatArray = formattedDate.split(' ');
    // for (var i = 0; i < fullMonthName.length; i++) {
    //     if (formatArray[0] == fullMonthName[i]) {
    //         formatArray[0] = months[i];
    //     }
    // }

    // for (var i = 0; i < formatArray.length; i++) {
    //     if (i == formatArray.length - 1) {
    //         resultStr += formatArray[i];
    //     } else {
    //         resultStr += formatArray[i] + " ";
    //     }
    // }
    const yearStr = changeTimeFormatGMT(input)
    const timestr = formattedDate.split('at')
    resultStr = yearStr + ' - ' + timestr[1]
  } else {
    resultStr = inputDate
  }

  return resultStr
}

export function changeTimeFormatGMT(inputDate: string) {
  const date = new Date(inputDate)
  const day = date.toLocaleDateString('en-US', { day: 'numeric' })
  const month = date.toLocaleDateString('en-US', { month: 'short' })
  const year = date.toLocaleDateString('en-US', { year: 'numeric' })

  return `${day}${getOrdinalIndicator(Number(day))} ${month} ${year}`
}

export function getOrdinalIndicator(day: number) {
  if (day > 3 && day < 21) return 'th'
  switch (day % 10) {
    case 1:
      return 'st'
    case 2:
      return 'nd'
    case 3:
      return 'rd'
    default:
      return 'th'
  }
}

export function to12HourFormatShort(d: string) {
  const date = new Date(d)

  let hours = date.getHours()
  let minutes: number | string = date.getMinutes()
  const ampm = hours >= 12 ? 'PM' : 'AM'

  hours = hours % 12
  hours = hours ? hours : 12

  minutes = minutes < 10 ? '0' + minutes : minutes

  const strTime = hours + ':' + minutes + ampm

  return strTime
}

export function formatMilliseconds(milliseconds: number) {
  const date = new Date(milliseconds)
  const today = new Date()

  // Check if the given date is today
  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  // Format the date
  const options = { weekday: 'long', month: 'short', day: 'numeric' }
  if (isToday) {
    // If the date is today, prepend "Today" to the formatted string
    return `Today, ${date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })}`
  } else {
    // Otherwise, format the date normally
    return date.toLocaleDateString('en-US', options as any)
  }
}
