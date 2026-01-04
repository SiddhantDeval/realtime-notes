'use client'
import React, { useState, useRef, useEffect } from 'react'
import { Bell, Check, X, Play, Square } from 'lucide-react'

export default function NotificationSystem() {
    const [permission, setPermission] = useState(Notification.permission)
    const [status, setStatus] = useState('')
    const [isBackgroundRunning, setIsBackgroundRunning] = useState(false)
    const [notificationInterval, setNotificationInterval] = useState(10)
    const audioRef = useRef(null)
    const intervalRef = useRef(null)
    const workerRef = useRef(null)

    useEffect(() => {
        const workerCode = `
      let intervalId = null;
      
      self.onmessage = function(e) {
        if (e.data.action === 'start') {
          if (intervalId) clearInterval(intervalId);
          intervalId = setInterval(() => {
            self.postMessage({ type: 'tick', timestamp: Date.now() });
          }, e.data.interval * 1000);
        } else if (e.data.action === 'stop') {
          if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
          }
        }
      };
    `

        const blob = new Blob([workerCode], { type: 'application/javascript' })
        const workerUrl = URL.createObjectURL(blob)
        workerRef.current = new Worker(workerUrl)

        workerRef.current.onmessage = (e) => {
            if (e.data.type === 'tick') {
                sendNotification(
                    'Background Notification',
                    `Automated notification at ${new Date(e.data.timestamp).toLocaleTimeString()}`,
                    `background-${e.data.timestamp}`
                )
            }
        }

        return () => {
            if (workerRef.current) {
                workerRef.current.terminate()
            }
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [])

    const requestPermission = async () => {
        try {
            const result = await Notification.requestPermission()
            setPermission(result)
            if (result === 'granted') {
                setStatus('Permission granted! You can now send notifications.')
            } else {
                setStatus("Permission denied. Notifications won't work.")
            }
        } catch (error) {
            setStatus('Error requesting permission: ' + error.message)
        }
    }

    const playNotificationSound = () => {
        const audioContext = new (
            window.AudioContext || window.webkitAudioContext
        )()
        const oscillator = audioContext.createOscillator()
        const gainNode = audioContext.createGain()

        oscillator.connect(gainNode)
        gainNode.connect(audioContext.destination)

        oscillator.frequency.value = 800
        oscillator.type = 'sine'

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            audioContext.currentTime + 0.5
        )

        oscillator.start(audioContext.currentTime)
        oscillator.stop(audioContext.currentTime + 0.5)
    }

    const vibrateDevice = () => {
        if ('vibrate' in navigator) {
            navigator.vibrate(200)
        }
    }

    const sendNotification = (title, body, tag = null) => {
        if (permission !== 'granted') {
            setStatus('Please grant notification permission first.')
            return
        }

        playNotificationSound()
        vibrateDevice()

        const notification = new Notification(title, {
            body: body,
            icon: 'https://cdn-icons-png.flaticon.com/512/3602/3602123.png',
            badge: 'https://cdn-icons-png.flaticon.com/512/3602/3602123.png',
            requireInteraction: true,
            tag: tag || `notification-${Date.now()}`,
            silent: false,
            vibrate: [200, 100, 200],
            timestamp: Date.now(),
        })

        notification.onclick = () => {
            window.focus()
            notification.close()
            setStatus('Notification clicked!')
        }

        notification.onclose = () => {
            setStatus('Notification closed.')
        }

        notification.onerror = (error) => {
            setStatus('Notification error: ' + error)
        }

        setStatus(`Notification sent: "${title}"`)
    }

    const startBackgroundNotifications = () => {
        if (permission !== 'granted') {
            setStatus('Please grant notification permission first.')
            return
        }

        setIsBackgroundRunning(true)
        setStatus(
            `Background notifications started (every ${notificationInterval} seconds)`
        )

        workerRef.current.postMessage({
            action: 'start',
            interval: notificationInterval,
        })
    }

    const stopBackgroundNotifications = () => {
        setIsBackgroundRunning(false)
        setStatus('Background notifications stopped')

        if (workerRef.current) {
            workerRef.current.postMessage({ action: 'stop' })
        }
    }

    const sendTestNotification = () => {
        sendNotification(
            'Test Notification',
            'This is a test notification with sound and vibration!',
            `test-${Date.now()}`
        )
    }

    const sendMultipleNotifications = () => {
        const messages = [
            { title: 'First Alert', body: 'This is the first notification' },
            { title: 'Second Alert', body: 'This is the second notification' },
            { title: 'Third Alert', body: 'This is the third notification' },
        ]

        messages.forEach((msg, index) => {
            setTimeout(() => {
                sendNotification(
                    msg.title,
                    msg.body,
                    `multi-${Date.now()}-${index}`
                )
            }, index * 1000)
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
            <div className="max-w-2xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Bell className="w-8 h-8 text-indigo-600" />
                        <h1 className="text-3xl font-bold text-gray-800">
                            Notification System
                        </h1>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-lg p-4">
                            <h2 className="font-semibold text-gray-700 mb-2">
                                Permission Status
                            </h2>
                            <div className="flex items-center gap-2">
                                {permission === 'granted' ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-600" />
                                        <span className="text-green-600 font-medium">
                                            Granted
                                        </span>
                                    </>
                                ) : permission === 'denied' ? (
                                    <>
                                        <X className="w-5 h-5 text-red-600" />
                                        <span className="text-red-600 font-medium">
                                            Denied
                                        </span>
                                    </>
                                ) : (
                                    <span className="text-gray-600 font-medium">
                                        Not Requested
                                    </span>
                                )}
                            </div>
                        </div>

                        {permission !== 'granted' && (
                            <button
                                onClick={requestPermission}
                                className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                            >
                                Request Notification Permission
                            </button>
                        )}

                        {permission === 'granted' && (
                            <div className="space-y-3">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                        <Play className="w-5 h-5 text-green-600" />
                                        Background Notifications
                                    </h3>

                                    <div className="flex items-center gap-3 mb-3">
                                        <label className="text-sm text-gray-600">
                                            Interval (seconds):
                                        </label>
                                        <input
                                            type="number"
                                            min="5"
                                            max="300"
                                            value={notificationInterval}
                                            onChange={(e) =>
                                                setNotificationInterval(
                                                    parseInt(e.target.value)
                                                )
                                            }
                                            disabled={isBackgroundRunning}
                                            className="border border-gray-300 rounded px-3 py-1 w-20 text-center disabled:bg-gray-100"
                                        />
                                    </div>

                                    {!isBackgroundRunning ? (
                                        <button
                                            onClick={
                                                startBackgroundNotifications
                                            }
                                            className="w-full bg-green-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Play className="w-4 h-4" />
                                            Start Background Notifications
                                        </button>
                                    ) : (
                                        <button
                                            onClick={
                                                stopBackgroundNotifications
                                            }
                                            className="w-full bg-red-600 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Square className="w-4 h-4" />
                                            Stop Background Notifications
                                        </button>
                                    )}

                                    {isBackgroundRunning && (
                                        <p className="text-xs text-green-700 mt-2 text-center">
                                            Running in background (works even in
                                            inactive tabs)
                                        </p>
                                    )}
                                </div>

                                <button
                                    onClick={sendTestNotification}
                                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                >
                                    Send Test Notification
                                </button>

                                <button
                                    onClick={sendMultipleNotifications}
                                    className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                                >
                                    Send Multiple Notifications (No Grouping)
                                </button>
                            </div>
                        )}

                        {status && (
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <p className="text-blue-800 text-sm">
                                    {status}
                                </p>
                            </div>
                        )}

                        <div className="bg-gray-50 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-700 mb-3">
                                Features:
                            </h3>
                            <ul className="space-y-2 text-sm text-gray-600">
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Background Running:</strong>{' '}
                                        Uses Web Worker to run even in inactive
                                        tabs
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Sound:</strong> Plays
                                        notification beep
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Vibration:</strong> Device
                                        vibrates on supported devices
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>Permanent:</strong> Requires
                                        user interaction to dismiss
                                    </span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                    <span>
                                        <strong>No Grouping:</strong> Each
                                        notification has unique tag
                                    </span>
                                </li>
                            </ul>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <h3 className="font-semibold text-amber-800 mb-2">
                                Note:
                            </h3>
                            <p className="text-amber-700 text-sm mb-2">
                                Notifications require browser permission and
                                work best on desktop browsers. Mobile browsers
                                may have limitations. The notification will stay
                                visible until you interact with it.
                            </p>
                            <p className="text-amber-700 text-sm">
                                <strong>Background Mode:</strong> Uses Web
                                Workers to continue running even when the tab is
                                inactive or minimized. You can switch to other
                                tabs and still receive notifications at the set
                                interval.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
