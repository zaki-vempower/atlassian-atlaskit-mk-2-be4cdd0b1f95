plan(key:'ABDITR',name:'trello Atlaskit Branch Deploy Integrator',
    description:'Creates branches on trello pulling in Atlaskit branch deploys to give Atlaskit build results on their PRs. **NOTE**: Master is disabled but every other branch is enabled',
    enabled:'false') {

    createBranchDeployIntegrator(
        sourceRepo: 'Atlaskit-MK-2',
        productRepo: 'trello-web',
        productCiPlanUrl: '',
        dockerContainer: 'atlassianlabs/atlaskit-mk-2:latest',
        packageEngine: 'yarn',
        integratorCmd: 'add',
        skipIntegrityCheck: false)

    branchMonitoring() {
        // createBranch()
        inactiveBranchCleanup(periodInDays:'14')
        deletedBranchCleanup(periodInDays:'7')
    }
    dependencies(triggerForBranches:'true')
    planMiscellaneous() {
        hungBuildKiller(enabled:'true')
        planOwnership(owner:'mdejongh')
    }
    permissions() {
        user(name:'mdejongh',permissions:'read,write,build,clone,administration')
    }
}
