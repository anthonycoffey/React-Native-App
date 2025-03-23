import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";
import { centsToDollars } from "@/utils/money";
import { Discount, Job } from "@/types";
import globalStyles from "@/styles/globalStyles";
import { CardTitle } from "@/components/Typography";

type Props = {
  job: Job;
};

export default function Discounts({ job }: Props) {
  const [discountsTotal, setDiscountsTotal] = useState<number>(0);

  useEffect(() => {
    // This function calculates the total of all discounts
    const calculateTotal = () => {
      const total =
        job.Discounts?.reduce((acc, item) => acc + item.amount, 0) ?? 0;
      setDiscountsTotal(total);
    };

    calculateTotal();
  }, [job.Discounts]); // This effect runs whenever job.Discounts changes

  const renderItem = ({ item }: { item: Discount }) => (
    <View style={styles.discountItem}>
      <Text style={styles.discountReason}>{item.reason}</Text>
      <Text style={styles.discountAmount}>{centsToDollars(item.amount)}</Text>
    </View>
  );

  return (
    <View style={[globalStyles.card, styles.container]}>
      <CardTitle>Discounts</CardTitle>
      <Text style={styles.totalText}>
        Total: {centsToDollars(+discountsTotal)}
      </Text>
      
      {job.Discounts && job.Discounts.length > 0 ? (
        <FlatList
          data={job.Discounts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id.toString()}
          style={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No discounts applied</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    elevation: 4,
    borderRadius: 8,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  totalText: {
    textAlign: "right",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 10,
  },
  list: {
    marginTop: 10,
  },
  discountItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  discountReason: {
    fontSize: 16,
    flex: 1,
  },
  discountAmount: {
    fontSize: 16,
    fontWeight: "500",
  },
  emptyText: {
    textAlign: 'center',
    padding: 10,
    color: '#666',
    fontStyle: 'italic',
  }
});