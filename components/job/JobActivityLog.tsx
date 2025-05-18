import React, { useState } from 'react';
import {
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Job } from '@/types';
import { CardTitle } from '@/components/Typography';
import globalStyles from '@/styles/globalStyles';
import { View, Text } from '@/components/Themed';
import { useColorScheme } from '@/components/useColorScheme';
import { getBorderColor } from '@/hooks/useThemeColor';

export default function JobActivityLog(props: { job: Job }) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Activity Log</CardTitle>

      <TouchableOpacity
        style={styles.toggleButton}
        onPress={() => setIsCollapsed(!isCollapsed)}
      >
        <Text 
          style={[
            styles.toggleButtonText,
            { color: colorScheme === 'dark' ? '#65b9d6' : '#0a7ea4' }
          ]}
        >
          {isCollapsed ? 'Show Log' : 'Hide Log'}
        </Text>
      </TouchableOpacity>

      {!isCollapsed &&
        props.job.JobActions &&
        props.job.JobActions.length > 0 && (
          <View style={styles.list}>
            {props.job.JobActions.map((item) => (
              <View 
                key={item.id.toString()} 
                style={[
                  styles.logItem,
                  { borderBottomColor: getBorderColor(colorScheme) }
                ]}
              >
                <Text style={styles.logText}>{item.action}</Text>
              </View>
            ))}
          </View>
        )}

      {!isCollapsed &&
        (!props.job.JobActions || props.job.JobActions.length === 0) && (
          <Text style={[
            styles.emptyText,
            { color: colorScheme === 'dark' ? '#9BA1A6' : '#666' }
          ]}>
            No activity log entries found
          </Text>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  toggleButton: {
    padding: 8,
    marginVertical: 8,
  },
  toggleButtonText: {
    fontSize: 16,
    textAlign: 'center',
  },
  list: {
    marginTop: 8,
  },
  logItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  logText: {
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    padding: 10,
    fontStyle: 'italic',
  },
});
