import {
  auditTestUserAmounts,
  disconnectAmountAudit,
} from "../tests/helpers/amount-audit";

async function main() {
  const audit = await auditTestUserAmounts();
  console.log(JSON.stringify(audit, null, 2));
  await disconnectAmountAudit();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
