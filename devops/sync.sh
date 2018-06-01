set -e

DRYRUN=1
TOTEST=1

if [ "$1" == "send" ]; then
  DRYRUN=
fi

if [ "$2" == "notest" ]; then
  TOTEST=
fi

if [[ -n $(git status -s) ]]; then
  echo "There are uncommitted files. Aborting!!!"
  exit 1
fi

current_branch() {
  git symbolic-ref --short HEAD
}
saved_branch=$(current_branch)

local_branches() {
  git for-each-ref --format="%(refname:short)" refs/heads
}
local_brs=$(local_branches)

list_brs=()
filter_branches(){
  list_brs=()
  for branch in $local_brs; do
    if [[ $branch == $1 ]]; then
      list_brs+=("${branch}")
    fi
  done
}

filter_branches "*-dev"
echo "Dev Tools are : ${list_brs[*]}"
echo

TOOL=product
BRANCH=dev

current_version() {
  node -e "console.log(require('./scripts/conf').version.split('.').shift())"
}

parent_branch() {
  local name=$(node -e "console.log(require('./scripts/conf').name)")
  local version=$(current_version)
  if [ "$name" == "product" ]; then
    if git show-ref --quiet refs/heads/v$((version + 1)); then
      BRANCH=master
    fi
    echo v$version
  else
    TOOL=$name
    if git show-ref --quiet "refs/heads/${name}-v$((version + 1))"; then
      BRANCH=master
    fi
    echo "${name}-v${version}"
  fi
}

par_br=$(parent_branch)

merge_me(){
  if [ "$DRYRUN" == "" ]; then
    git merge $1
    if [ "$TOTEST" == "1" ]; then
      npm test
      npm run build
      npm run prodtest
    fi
  else
    local cr=$(current_branch)
    echo "===> Branch $1 will be merged into $cr"
  fi
}

merge_peers(){
  filter_branches $1
  for peer in "${list_brs[@]}"; do
    if [ "${peer}" != "$2" ]; then
      git checkout $peer
      merge_me $2
    fi
  done
}

common(){
  cv=$(current_version)
  ci=$(current_branch)
  sep2="-"
  devormaster=dev
  ctp=$1
  sep=$2
	git checkout ${ctp}${sep}v${cv}
  merge_me $ci
	git checkout ${ctp}${sep}${devormaster}
	merge_me ${ctp}${sep}v${cv}
  merge_peers "${ctp}${sep}v${cv}${sep2}*" ${ctp}${sep}v${cv}
}

common_master(){
  cv=$(current_version)
  ci=$(current_branch)
	ctp=$TOOL
	sep="-"
	git checkout ${ctp}${sep}v${cv}
	merge_me $ci
  git checkout $1
  mcv=$(current_version)
  if [ "$cv" == "$mcv" ]; then
	  devormaster=""
    sep=""
    merge_me ${ctp}${sep}v${cv}
  fi
}

if [ "$TOOL" != "product" ] && [ "$BRANCH" == "dev" ]; then
  common $TOOL -
elif [ "$TOOL" == "product" ] && [ "$BRANCH" == "dev" ]; then
  common
  filter_branches "*-dev"
  for peer in "${list_brs[@]}"; do
    git checkout ${peer};
    cv=$(current_version)
    merge_me dev
    tl=${peer::-4}
    sep = "-"
    sep2 = "-"
    git checkout ${tl}${sep}v${cv};
    merge_me ${peer}
    merge_peers "${tl}${sep}v${cv}${sep2}*" ${tl}${sep}v${cv}
  done
elif [ "$TOOL" != "product" ] && [ "$BRANCH" == "master" ]; then
  common_master $TOOL
elif [ "$TOOL" == "product" ] && [ "$BRANCH" == "master" ]; then
  common_master master
fi

echo
[[ "${saved_branch}" != "$(current_branch)" ]] && git checkout "${saved_branch}"
if [ "$DRYRUN" == "" ]; then
  git push origin --all
fi
