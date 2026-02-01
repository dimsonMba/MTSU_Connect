import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { Message } from '@/types';

interface ChatBubbleProps {
  message: Message;
}

export function ChatBubble({ message }: ChatBubbleProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={[styles.container, message.isOwn ? styles.ownContainer : styles.otherContainer]}>
      {!message.isOwn && (
        <Text style={styles.senderName}>{message.senderName}</Text>
      )}
      <View style={[styles.bubble, message.isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.messageText, message.isOwn && styles.ownMessageText]}>
          {message.content}
        </Text>
      </View>
      <Text style={[styles.timestamp, message.isOwn && styles.ownTimestamp]}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600' as const,
    color: colors.primary,
    marginBottom: 2,
    marginLeft: 12,
  },
  bubble: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: colors.background,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 20,
  },
  ownMessageText: {
    color: colors.white,
  },
  timestamp: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 4,
    marginHorizontal: 12,
  },
  ownTimestamp: {
    color: colors.textMuted,
  },
});
