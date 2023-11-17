import React, { useEffect, useState } from "react";
import { View, ListItem, Card, Text } from "tamagui";
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

  return (
    <Card style={globalStyles.card} elevation={4}>
      <CardTitle>Discounts</CardTitle>
      <Text style={{ textAlign: "right" }}>
        Total: {centsToDollars(+discountsTotal)}
      </Text>
      <View>
        {job.Discounts?.map((item: Discount) => (
          <ListItem key={item.id} title={item.reason}></ListItem>
        ))}
      </View>
    </Card>
  );
}
